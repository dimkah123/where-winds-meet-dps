"""
Where Winds Meet — Rotation Trainer Companion Server
Captures global Windows keyboard and mouse events and streams them via WebSocket
to the WWM Calculator Picture-in-Picture overlay in real time.
"""

import asyncio
import base64
import ctypes
import hashlib
import json
import os
import struct
import sys
import time

try:
    sys.stdout.reconfigure(line_buffering=True)
except Exception:
    pass

HAS_KEYBOARD_PKG = False
try:
    import keyboard
    HAS_KEYBOARD_PKG = True
except ImportError:
    HAS_KEYBOARD_PKG = False

WS_HOST = "127.0.0.1"
WS_PORT = 47999

# Windows VK Codes for Mouse and Keys (native ctypes fallback with 0 dependencies)
VK_LBUTTON = 0x01
VK_RBUTTON = 0x02
VK_MBUTTON = 0x04

user32 = ctypes.windll.user32

connected_clients = set()
event_queue = asyncio.Queue()

# Comprehensive Virtual-Key mapping for native ctypes capture (zero dependencies)
TRACKED_VKS = {
    # Mouse
    0x01: ("lclick", "mouse"),
    0x02: ("rclick", "mouse"),
    0x04: ("mclick", "mouse"),
    # Skills / Combat
    0xC0: ("~", "keyboard"),       # VK_OEM_3 (` ~ ё)
    0x51: ("q", "keyboard"),
    0x52: ("r", "keyboard"),
    0x09: ("tab", "keyboard"),
    0x45: ("e", "keyboard"),
    0x46: ("f", "keyboard"),
    0x10: ("shift", "keyboard"),
    0xA0: ("shift", "keyboard"),   # VK_LSHIFT
    0xA1: ("shift", "keyboard"),   # VK_RSHIFT
    0x20: ("space", "keyboard"),
    0x11: ("ctrl", "keyboard"),
    0x12: ("alt", "keyboard"),
    0x1B: ("escape", "keyboard"),
    # Numbers
    0x31: ("1", "keyboard"),
    0x32: ("2", "keyboard"),
    0x33: ("3", "keyboard"),
    0x34: ("4", "keyboard"),
    0x35: ("5", "keyboard"),
    0x36: ("6", "keyboard"),
    # Common combat letters
    0x41: ("a", "keyboard"),
    0x43: ("c", "keyboard"),
    0x44: ("d", "keyboard"),
    0x53: ("s", "keyboard"),
    0x56: ("v", "keyboard"),
    0x57: ("w", "keyboard"),
    0x58: ("x", "keyboard"),
    0x5A: ("z", "keyboard"),
}


def make_ws_handshake(key: str) -> str:
    magic = b"258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    digest = hashlib.sha1(key.encode("utf-8") + magic).digest()
    return base64.b64encode(digest).decode("utf-8")


def frame_ws_message(payload_str: str) -> bytes:
    data = payload_str.encode("utf-8")
    length = len(data)
    if length <= 125:
        header = struct.pack("!BB", 0x81, length)
    elif length <= 65535:
        header = struct.pack("!BBH", 0x81, 126, length)
    else:
        header = struct.pack("!BBQ", 0x81, 127, length)
    return header + data


RU_TO_EN = {
    "й": "q", "ц": "w", "у": "e", "к": "r", "е": "t", "н": "y", "г": "u", "ш": "i", "щ": "o", "з": "p",
    "х": "[", "ъ": "]", "ф": "a", "ы": "s", "в": "d", "а": "f", "п": "g", "р": "h", "о": "j", "л": "k",
    "д": "l", "ж": ";", "э": "'", "я": "z", "ч": "x", "с": "c", "м": "v", "и": "b", "т": "n", "ь": "m",
    "б": ",", "ю": ".", "ё": "~", "`": "~",
}


def normalize_key(name: str) -> str:
    n = name.lower().strip()
    if n in ("`", "~", "grave", "tilde", "ё"):
        return "~"
    return RU_TO_EN.get(n, n)


held_keys = set()


def on_keyboard_event(e):
    if not connected_clients:
        return
    norm = normalize_key(e.name)
    event_type = "down" if e.event_type == "down" else "up"

    # Filter out OS auto-repeat for held keys
    if event_type == "down":
        if norm in held_keys:
            return  # Auto-repeat dropped!
        held_keys.add(norm)
    elif event_type == "up":
        held_keys.discard(norm)

    event_data = {
        "type": "input",
        "action": event_type,
        "key": norm,
        "device": "keyboard",
        "time": time.time(),
    }
    try:
        event_queue.put_nowait(event_data)
    except Exception:
        pass


async def mouse_polling_loop():
    """Poll mouse button states using GetAsyncKeyState (0x8000 = currently down)."""
    l_down = False
    r_down = False
    m_down = False

    while True:
        try:
            # Left Click
            is_l = bool(user32.GetAsyncKeyState(VK_LBUTTON) & 0x8000)
            if is_l != l_down:
                l_down = is_l
                if connected_clients:
                    await event_queue.put({
                        "type": "input",
                        "action": "down" if l_down else "up",
                        "key": "lclick",
                        "device": "mouse",
                        "time": time.time(),
                    })

            # Right Click
            is_r = bool(user32.GetAsyncKeyState(VK_RBUTTON) & 0x8000)
            if is_r != r_down:
                r_down = is_r
                if connected_clients:
                    await event_queue.put({
                        "type": "input",
                        "action": "down" if r_down else "up",
                        "key": "rclick",
                        "device": "mouse",
                        "time": time.time(),
                    })

            # Middle Click
            is_m = bool(user32.GetAsyncKeyState(VK_MBUTTON) & 0x8000)
            if is_m != m_down:
                m_down = is_m
                if connected_clients:
                    await event_queue.put({
                        "type": "input",
                        "action": "down" if m_down else "up",
                        "key": "mclick",
                        "device": "mouse",
                        "time": time.time(),
                    })
        except Exception:
            pass
        await asyncio.sleep(0.005)  # 5ms fast poll for near-zero latency


async def ctypes_input_polling_loop():
    """Poll keyboard and mouse states using Windows GetAsyncKeyState (0 dependencies)."""
    states = {}
    while True:
        try:
            for vk, (name, device) in TRACKED_VKS.items():
                is_down = bool(user32.GetAsyncKeyState(vk) & 0x8000)
                prev = states.get(vk, False)
                if is_down != prev:
                    states[vk] = is_down
                    if connected_clients:
                        await event_queue.put({
                            "type": "input",
                            "action": "down" if is_down else "up",
                            "key": name,
                            "device": device,
                            "time": time.time(),
                        })
        except Exception:
            pass
        await asyncio.sleep(0.005)


async def broadcaster_loop():
    while True:
        event = await event_queue.get()
        if not connected_clients:
            continue
        payload = json.dumps(event)
        framed = frame_ws_message(payload)
        to_remove = set()
        for writer in connected_clients:
            try:
                writer.write(framed)
                await writer.drain()
            except Exception:
                to_remove.add(writer)
        for dead in to_remove:
            connected_clients.discard(dead)


async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    remote = writer.get_extra_info("peername")
    headers = b""
    while b"\r\n\r\n" not in headers:
        line = await reader.readline()
        if not line:
            writer.close()
            return
        headers += line

    headers_str = headers.decode("utf-8", errors="ignore")
    sec_key = None
    for header in headers_str.split("\r\n"):
        if header.lower().startswith("sec-websocket-key:"):
            sec_key = header.split(":", 1)[1].strip()
            break

    if not sec_key:
        writer.close()
        return

    accept = make_ws_handshake(sec_key)
    handshake_resp = (
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Accept: {accept}\r\n\r\n"
    )
    writer.write(handshake_resp.encode("utf-8"))
    await writer.drain()

    connected_clients.add(writer)
    print(f"[OK] WWM Trainer overlay connected from {remote}!")

    # Send welcome handshake
    init_msg = json.dumps({
        "type": "connected",
        "message": "WWM Trainer Companion active",
        "time": time.time(),
    })
    writer.write(frame_ws_message(init_msg))
    await writer.drain()

    try:
        while True:
            data = await reader.read(1024)
            if not data:
                break
    except Exception:
        pass
    finally:
        connected_clients.discard(writer)
        print(f"[Disconnected] Overlay disconnected: {remote}")
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass


async def main():
    print("=" * 64)
    print("  Where Winds Meet — Rotation Trainer Companion Service")
    print("=" * 64)
    print(f"  Status: Listening on ws://{WS_HOST}:{WS_PORT}")
    if HAS_KEYBOARD_PKG:
        print("  Input Engine: 'keyboard' library + Win32 mouse hook")
        keyboard.hook(on_keyboard_event)
        input_task = mouse_polling_loop()
    else:
        print("  Input Engine: Native Windows Win32 ctypes (0 external packages needed)")
        input_task = ctypes_input_polling_loop()

    print("  Capturing global keys (keyboard + mouse) for game trainer overlay.")
    print("  Keep this window open while playing or practicing.")
    print("  Press Ctrl+C to stop.")
    print("=" * 64)

    server = await asyncio.start_server(handle_client, WS_HOST, WS_PORT)

    async with server:
        await asyncio.gather(
            server.serve_forever(),
            broadcaster_loop(),
            input_task,
        )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nCompanion stopped.")
