"""
Where Winds Meet — Rotation Trainer Companion Server
Captures global Windows keyboard and mouse events and streams them via WebSocket
to the WWM Calculator Picture-in-Picture overlay in real time.

Uses native Win32 GetAsyncKeyState differential polling:
- Works inside 3D DirectX / Unreal Engine games (Where Winds Meet)
- Zero external package dependencies (no pip install required)
- Automatically requests Administrator elevation so Windows UIPI allows capturing
  input when elevated game windows have focus.
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

WS_HOST = "127.0.0.1"
WS_PORT = 47999

user32 = ctypes.windll.user32
shell32 = ctypes.windll.shell32

connected_clients = set()
event_queue = asyncio.Queue()


def is_admin() -> bool:
    try:
        return bool(shell32.IsUserAnAdmin())
    except Exception:
        return False


def ensure_admin():
    """Ensure the process runs with Administrator rights to bypass Windows UIPI in games."""
    if is_admin():
        return True

    print("=" * 66)
    print("  [Elevation Required] Requesting Administrator Privileges...")
    print("  Windows UIPI requires Administrator rights to capture keys")
    print("  inside elevated games like Where Winds Meet.")
    print("=" * 66)

    try:
        if getattr(sys, "frozen", False):
            ret = shell32.ShellExecuteW(None, "runas", sys.executable, "", None, 1)
        else:
            script = os.path.abspath(sys.argv[0])
            args = " ".join(f'"{a}"' for a in sys.argv[1:])
            ret = shell32.ShellExecuteW(
                None, "runas", sys.executable, f'"{script}" {args}'.strip(), None, 1
            )
        if ret > 32:
            sys.exit(0)
    except Exception as e:
        print(f"  [Notice] Elevation request: {e}")

    print("\n  [Внимание] Для перехвата кнопок прямо в игре Where Winds Meet:")
    print("  Пожалуйста, запустите WWM-Companion от имени Администратора!")
    print("  (Правый клик по файлу -> 'Запуск от имени администратора')\n")
    return False


# Virtual-Key codes mapping for GetAsyncKeyState differential polling
TRACKED_VKS = {
    # Mouse buttons
    0x01: ("lclick", "mouse"),      # VK_LBUTTON
    0x02: ("rclick", "mouse"),      # VK_RBUTTON
    0x04: ("mclick", "mouse"),      # VK_MBUTTON
    0x05: ("mouse4", "mouse"),      # VK_XBUTTON1
    0x06: ("mouse5", "mouse"),      # VK_XBUTTON2

    # Combat Skills / Keys
    0xC0: ("~", "keyboard"),        # VK_OEM_3 (` ~ ё)
    0x51: ("q", "keyboard"),        # Q (й)
    0x52: ("r", "keyboard"),        # R (к)
    0x45: ("e", "keyboard"),        # E (у)
    0x46: ("f", "keyboard"),        # F (а)
    0x09: ("tab", "keyboard"),      # Tab
    0x10: ("shift", "keyboard"),    # Shift
    0xA0: ("shift", "keyboard"),    # LShift
    0xA1: ("shift", "keyboard"),    # RShift
    0x20: ("space", "keyboard"),    # Space
    0x11: ("ctrl", "keyboard"),     # Ctrl
    0xA2: ("ctrl", "keyboard"),     # LCtrl
    0xA3: ("ctrl", "keyboard"),     # RCtrl
    0x12: ("alt", "keyboard"),      # Alt
    0xA4: ("alt", "keyboard"),      # LAlt
    0xA5: ("alt", "keyboard"),      # RAlt
    0x1B: ("escape", "keyboard"),   # Esc
    0x14: ("caps", "keyboard"),     # Caps Lock
    0x0D: ("enter", "keyboard"),    # Enter

    # Movement / Actions (WASD + nearby)
    0x57: ("w", "keyboard"),        # W (ц)
    0x41: ("a", "keyboard"),        # A (ф)
    0x53: ("s", "keyboard"),        # S (ы)
    0x44: ("d", "keyboard"),        # D (в)
    0x5A: ("z", "keyboard"),        # Z (я)
    0x58: ("x", "keyboard"),        # X (ч)
    0x43: ("c", "keyboard"),        # C (с)
    0x56: ("v", "keyboard"),        # V (м)
    0x42: ("b", "keyboard"),        # B (и)
    0x47: ("g", "keyboard"),        # G (п)
    0x54: ("t", "keyboard"),        # T (е)
    0x59: ("y", "keyboard"),        # Y (н)

    # Rest of letters A-Z
    0x48: ("h", "keyboard"),
    0x49: ("i", "keyboard"),
    0x4A: ("j", "keyboard"),
    0x4B: ("k", "keyboard"),
    0x4C: ("l", "keyboard"),
    0x4D: ("m", "keyboard"),
    0x4E: ("n", "keyboard"),
    0x4F: ("o", "keyboard"),
    0x50: ("p", "keyboard"),
    0x55: ("u", "keyboard"),

    # Numbers 1-0
    0x31: ("1", "keyboard"),
    0x32: ("2", "keyboard"),
    0x33: ("3", "keyboard"),
    0x34: ("4", "keyboard"),
    0x35: ("5", "keyboard"),
    0x36: ("6", "keyboard"),
    0x37: ("7", "keyboard"),
    0x38: ("8", "keyboard"),
    0x39: ("9", "keyboard"),
    0x30: ("0", "keyboard"),

    # Function keys F1-F12
    0x70: ("f1", "keyboard"),
    0x71: ("f2", "keyboard"),
    0x72: ("f3", "keyboard"),
    0x73: ("f4", "keyboard"),
    0x74: ("f5", "keyboard"),
    0x75: ("f6", "keyboard"),
    0x76: ("f7", "keyboard"),
    0x77: ("f8", "keyboard"),
    0x78: ("f9", "keyboard"),
    0x79: ("f10", "keyboard"),
    0x7A: ("f11", "keyboard"),
    0x7B: ("f12", "keyboard"),
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


async def unified_input_polling_loop():
    """
    Ultra-low latency polling loop using Windows GetAsyncKeyState.
    Works inside full-screen DirectX / Unreal Engine games (Where Winds Meet)
    and is not blocked by anti-cheat or UIPI when running as Administrator.
    """
    prev_active = set()

    while True:
        try:
            current_active = set()
            for vk, (name, device) in TRACKED_VKS.items():
                if user32.GetAsyncKeyState(vk) & 0x8000:
                    current_active.add((name, device))

            pressed = current_active - prev_active
            released = prev_active - current_active

            now = time.time()
            if connected_clients:
                for name, device in pressed:
                    await event_queue.put({
                        "type": "input",
                        "action": "down",
                        "key": name,
                        "device": device,
                        "time": now,
                    })
                for name, device in released:
                    await event_queue.put({
                        "type": "input",
                        "action": "up",
                        "key": name,
                        "device": device,
                        "time": now,
                    })

            prev_active = current_active
        except Exception:
            pass

        # 4ms poll gives ~250 Hz sample rate (sub-frame precision for 60-144 FPS)
        await asyncio.sleep(0.004)


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
    print(f"  [PiP Overlay Connected] from {remote}")

    try:
        request_data = b""
        while b"\r\n\r\n" not in request_data:
            chunk = await reader.read(1024)
            if not chunk:
                break
            request_data += chunk

        req_str = request_data.decode("utf-8", errors="ignore")
        ws_key = None
        for line in req_str.split("\r\n"):
            if line.lower().startswith("sec-websocket-key:"):
                ws_key = line.split(":", 1)[1].strip()
                break

        if not ws_key:
            writer.close()
            await writer.wait_closed()
            return

        accept_val = make_ws_handshake(ws_key)
        resp = (
            "HTTP/1.1 101 Switching Protocols\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Accept: {accept_val}\r\n"
            "\r\n"
        )
        writer.write(resp.encode("utf-8"))
        await writer.drain()

        # Send welcome status
        connected_clients.add(writer)
        welcome = {
            "type": "status",
            "connected": True,
            "version": "1.3.2",
            "isAdmin": is_admin(),
            "engine": "GetAsyncKeyState-Native-Win32",
        }
        writer.write(frame_ws_message(json.dumps(welcome)))
        await writer.drain()

        while True:
            head = await reader.read(2)
            if not head or len(head) < 2:
                break
            b1, b2 = head[0], head[1]
            opcode = b1 & 0x0F
            if opcode == 0x8:  # Close
                break

            masked = bool(b2 & 0x80)
            payload_len = b2 & 0x7F
            if payload_len == 126:
                ext = await reader.read(2)
                payload_len = struct.unpack("!H", ext)[0]
            elif payload_len == 127:
                ext = await reader.read(8)
                payload_len = struct.unpack("!Q", ext)[0]

            mask_bytes = await reader.read(4) if masked else b""
            data = await reader.read(payload_len)

            if opcode == 0x9:  # Ping
                writer.write(struct.pack("!BB", 0x8A, 0))
                await writer.drain()

    except Exception:
        pass
    finally:
        connected_clients.discard(writer)
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass
        print(f"  [PiP Overlay Disconnected] from {remote}")


async def main():
    ensure_admin()

    admin_status = "ENABLED (Full In-Game Capture)" if is_admin() else "NOT ELEVATED (Desktop only)"

    print("=" * 66)
    print("  Where Winds Meet — Rotation Trainer Companion Service")
    print("=" * 66)
    print(f"  Status: Listening on ws://{WS_HOST}:{WS_PORT}")
    print(f"  Administrator Rights: {admin_status}")
    print("  Input Engine: Native Windows Win32 (GetAsyncKeyState 250Hz)")
    print("  Zero external dependencies required.")
    print("  Capturing global keys & mouse for game trainer overlay.")
    print("  Keep this window open while playing or practicing.")
    print("  Press Ctrl+C to stop.")
    print("=" * 66)

    server = await asyncio.start_server(handle_client, WS_HOST, WS_PORT)

    async with server:
        await asyncio.gather(
            server.serve_forever(),
            broadcaster_loop(),
            unified_input_polling_loop(),
        )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nCompanion stopped.")
