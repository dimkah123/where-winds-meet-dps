"""
Where Winds Meet — All-in-One Desktop Launcher & Companion Server
Combines:
1. Local HTTP server serving the compiled WWM Calculator & Rotation Trainer (dist/)
2. Native Win32 Companion Service (GetAsyncKeyState differential polling & RawInput wheel)
3. Instant standalone application window launcher (Edge / Chrome --app mode)

Zero external pip package dependencies.
Compiles into a standalone Windows .EXE with PyInstaller.
"""

import asyncio
import base64
import ctypes
import ctypes.wintypes
import hashlib
import http.server
import json
import mimetypes
import os
import struct
import subprocess
import sys
import threading
import time
import webbrowser

# Resolve web assets directory (works both in development and inside PyInstaller bundle)
if getattr(sys, "frozen", False):
    BUNDLE_DIR = sys._MEIPASS
    DIST_DIR = os.path.join(BUNDLE_DIR, "dist")
else:
    BUNDLE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    DIST_DIR = os.path.join(BUNDLE_DIR, "dist")

HTTP_HOST = "127.0.0.1"
HTTP_PORT = 47998
WS_HOST = "127.0.0.1"
WS_PORT = 47999

user32 = ctypes.windll.user32
shell32 = ctypes.windll.shell32
kernel32 = ctypes.windll.kernel32

connected_clients = set()
event_queue = asyncio.Queue()

# Ensure standard mimetypes
mimetypes.init()
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/wasm", ".wasm")
mimetypes.add_type("application/json", ".json")


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    """Serves the static Vite/React build with Single-Page Application (SPA) fallback."""

    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory or DIST_DIR, **kwargs)

    def do_GET(self):
        local_path = self.translate_path(self.path)
        if not os.path.exists(local_path) or (
            os.path.isdir(local_path) and not os.path.exists(os.path.join(local_path, "index.html"))
        ):
            # Fallback to index.html for client-side routing
            self.path = "/index.html"
        return super().do_GET()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, format, *args):
        # Keep console output clean
        pass


def start_http_server(dist_dir: str, host: str = HTTP_HOST, port: int = HTTP_PORT):
    handler = lambda *args, **kwargs: SPAHandler(*args, directory=dist_dir, **kwargs)
    httpd = http.server.ThreadingHTTPServer((host, port), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd


def launch_app_window(url: str = f"http://{HTTP_HOST}:{HTTP_PORT}"):
    """Launches the calculator in a dedicated app window (without browser tabs or address bar)."""
    # 1. Edge (standard on all Windows 10/11)
    edge_paths = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
    ]
    for p in edge_paths:
        if os.path.isfile(p):
            try:
                subprocess.Popen([p, f"--app={url}"])
                return
            except Exception:
                pass

    # 2. Chrome
    chrome_paths = [
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
    ]
    for p in chrome_paths:
        if os.path.isfile(p):
            try:
                subprocess.Popen([p, f"--app={url}"])
                return
            except Exception:
                pass

    # 3. Default browser fallback
    webbrowser.open(url)


# Win32 API setup for Companion
WNDPROC = ctypes.WINFUNCTYPE(
    ctypes.c_ssize_t, ctypes.c_void_p, ctypes.c_uint, ctypes.wintypes.WPARAM, ctypes.wintypes.LPARAM
)
user32.DefWindowProcW.argtypes = [
    ctypes.c_void_p,
    ctypes.c_uint,
    ctypes.wintypes.WPARAM,
    ctypes.wintypes.LPARAM,
]
user32.DefWindowProcW.restype = ctypes.c_ssize_t

user32.CreateWindowExW.argtypes = [
    ctypes.wintypes.DWORD,
    ctypes.c_wchar_p,
    ctypes.c_wchar_p,
    ctypes.wintypes.DWORD,
    ctypes.c_int,
    ctypes.c_int,
    ctypes.c_int,
    ctypes.c_int,
    ctypes.c_void_p,
    ctypes.c_void_p,
    ctypes.c_void_p,
    ctypes.c_void_p,
]
user32.CreateWindowExW.restype = ctypes.c_void_p
kernel32.GetModuleHandleW.argtypes = [ctypes.c_wchar_p]
kernel32.GetModuleHandleW.restype = ctypes.c_void_p


def is_admin() -> bool:
    try:
        return bool(shell32.IsUserAnAdmin())
    except Exception:
        return False


def ensure_admin():
    """Ensure process runs as Administrator to capture keys from elevated games."""
    if is_admin():
        return True

    print("=" * 68)
    print("  [Elevation Required] Requesting Administrator Privileges...")
    print("  Windows UIPI requires Administrator rights to capture keys")
    print("  inside elevated games like Where Winds Meet.")
    print("=" * 68)

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
    print("  Пожалуйста, запустите калькулятор от имени Администратора!")
    print("  (Правый клик по файлу -> 'Запуск от имени администратора')\n")
    return False


# Virtual-Key codes mapping for GetAsyncKeyState differential polling
TRACKED_VKS = {
    0x01: ("lclick", "mouse"),
    0x02: ("rclick", "mouse"),
    0x04: ("mclick", "mouse"),
    0x05: ("mouse4", "mouse"),
    0x06: ("mouse5", "mouse"),
    0xC0: ("~", "keyboard"),
    0x51: ("q", "keyboard"),
    0x52: ("r", "keyboard"),
    0x45: ("e", "keyboard"),
    0x46: ("f", "keyboard"),
    0x09: ("tab", "keyboard"),
    0x10: ("shift", "keyboard"),
    0xA0: ("shift", "keyboard"),
    0xA1: ("shift", "keyboard"),
    0x20: ("space", "keyboard"),
    0x11: ("ctrl", "keyboard"),
    0xA2: ("ctrl", "keyboard"),
    0xA3: ("ctrl", "keyboard"),
    0x12: ("alt", "keyboard"),
    0xA4: ("alt", "keyboard"),
    0xA5: ("alt", "keyboard"),
    0x1B: ("escape", "keyboard"),
    0x14: ("caps", "keyboard"),
    0x0D: ("enter", "keyboard"),
    0x57: ("w", "keyboard"),
    0x41: ("a", "keyboard"),
    0x53: ("s", "keyboard"),
    0x44: ("d", "keyboard"),
    0x5A: ("z", "keyboard"),
    0x58: ("x", "keyboard"),
    0x43: ("c", "keyboard"),
    0x56: ("v", "keyboard"),
    0x42: ("b", "keyboard"),
    0x47: ("g", "keyboard"),
    0x54: ("t", "keyboard"),
    0x59: ("y", "keyboard"),
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


# RawInput for non-blocking mouse wheel capture
RID_INPUT = 0x10000003
RIDEV_INPUTSINK = 0x00000100
RI_MOUSE_WHEEL = 0x0400
WM_INPUT = 0x00FF
WS_POPUP = 0x80000000


class RAWINPUTHEADER(ctypes.Structure):
    _fields_ = [
        ("dwType", ctypes.wintypes.DWORD),
        ("dwSize", ctypes.wintypes.DWORD),
        ("hDevice", ctypes.c_void_p),
        ("wParam", ctypes.wintypes.WPARAM),
    ]


class RAWMOUSE_BUTTONS(ctypes.Structure):
    _fields_ = [("usButtonFlags", ctypes.c_ushort), ("usButtonData", ctypes.c_short)]


class RAWMOUSE_UNION(ctypes.Union):
    _fields_ = [("ulButtons", ctypes.wintypes.ULONG), ("buttons", RAWMOUSE_BUTTONS)]


class RAWMOUSE(ctypes.Structure):
    _fields_ = [
        ("usFlags", ctypes.c_ushort),
        ("u", RAWMOUSE_UNION),
        ("ulRawButtons", ctypes.wintypes.ULONG),
        ("lLastX", ctypes.c_long),
        ("lLastY", ctypes.c_long),
        ("ulExtraInformation", ctypes.wintypes.ULONG),
    ]


class RAWINPUT(ctypes.Structure):
    _fields_ = [("header", RAWINPUTHEADER), ("mouse", RAWMOUSE)]


class RAWINPUTDEVICE(ctypes.Structure):
    _fields_ = [
        ("usUsagePage", ctypes.c_ushort),
        ("usUsage", ctypes.c_ushort),
        ("dwFlags", ctypes.wintypes.DWORD),
        ("hwndTarget", ctypes.c_void_p),
    ]


user32.GetRawInputData.argtypes = [
    ctypes.c_void_p,
    ctypes.c_uint,
    ctypes.c_void_p,
    ctypes.POINTER(ctypes.c_uint),
    ctypes.c_uint,
]
user32.GetRawInputData.restype = ctypes.c_uint

user32.RegisterRawInputDevices.argtypes = [
    ctypes.POINTER(RAWINPUTDEVICE),
    ctypes.c_uint,
    ctypes.c_uint,
]
user32.RegisterRawInputDevices.restype = ctypes.wintypes.BOOL


class WNDCLASSW(ctypes.Structure):
    _fields_ = [
        ("style", ctypes.c_uint),
        ("lpfnWndProc", WNDPROC),
        ("cbClsExtra", ctypes.c_int),
        ("cbWndExtra", ctypes.c_int),
        ("hInstance", ctypes.c_void_p),
        ("hIcon", ctypes.c_void_p),
        ("hCursor", ctypes.c_void_p),
        ("hbrBackground", ctypes.c_void_p),
        ("lpszMenuName", ctypes.c_wchar_p),
        ("lpszClassName", ctypes.c_wchar_p),
    ]


_last_wheel_time = 0.0
_last_wheel_dir = ""


def emit_wheel_input(direction: str, loop: asyncio.AbstractEventLoop):
    global _last_wheel_time, _last_wheel_dir
    now = time.time()
    if _last_wheel_dir == direction and (now - _last_wheel_time) < 0.040:
        return
    _last_wheel_dir = direction
    _last_wheel_time = now

    if connected_clients:
        loop.call_soon_threadsafe(
            event_queue.put_nowait,
            {
                "type": "input",
                "action": "down",
                "key": direction,
                "device": "mouse",
                "time": now,
            },
        )


_wnd_proc_ref = None


def mouse_wheel_listener_thread(loop: asyncio.AbstractEventLoop):
    global _wnd_proc_ref

    hinst = kernel32.GetModuleHandleW(None)

    def wnd_proc(hwnd, msg, wparam, lparam):
        if msg == WM_INPUT:
            try:
                size = ctypes.c_uint(ctypes.sizeof(RAWINPUT))
                raw = RAWINPUT()
                if (
                    user32.GetRawInputData(
                        lparam,
                        RID_INPUT,
                        ctypes.byref(raw),
                        ctypes.byref(size),
                        ctypes.sizeof(RAWINPUTHEADER),
                    )
                    != 0xFFFFFFFF
                ):
                    if raw.header.dwType == 0:
                        flags = raw.mouse.u.buttons.usButtonFlags
                        if flags & RI_MOUSE_WHEEL:
                            delta = raw.mouse.u.buttons.usButtonData
                            direction = "wheeldown" if delta < 0 else "wheelup"
                            emit_wheel_input(direction, loop)
            except Exception:
                pass
        return user32.DefWindowProcW(hwnd, msg, wparam, lparam)

    _wnd_proc_ref = WNDPROC(wnd_proc)

    cls_name = "WWMWheelSinkClass"
    wc = WNDCLASSW()
    wc.lpfnWndProc = _wnd_proc_ref
    wc.hInstance = hinst
    wc.lpszClassName = cls_name
    user32.RegisterClassW(ctypes.byref(wc))

    hwnd = user32.CreateWindowExW(
        0, cls_name, "WWMWheelSink", WS_POPUP, 0, 0, 0, 0, None, None, hinst, None
    )

    rid = RAWINPUTDEVICE()
    rid.usUsagePage = 0x01
    rid.usUsage = 0x02
    rid.dwFlags = RIDEV_INPUTSINK
    rid.hwndTarget = hwnd
    user32.RegisterRawInputDevices(ctypes.byref(rid), 1, ctypes.sizeof(RAWINPUTDEVICE))

    msg = ctypes.wintypes.MSG()
    while user32.GetMessageW(ctypes.byref(msg), None, 0, 0) > 0:
        user32.TranslateMessage(ctypes.byref(msg))
        user32.DispatchMessageW(ctypes.byref(msg))


async def unified_input_polling_loop():
    """Polls keyboard and mouse button states differential at 250Hz."""
    previous_states = {vk: False for vk in TRACKED_VKS}
    poll_interval = 0.004

    while True:
        try:
            if not connected_clients:
                await asyncio.sleep(0.05)
                continue

            now = time.time()
            for vk, (name, device) in TRACKED_VKS.items():
                state = bool(user32.GetAsyncKeyState(vk) & 0x8000)
                prev = previous_states[vk]

                if state != prev:
                    previous_states[vk] = state
                    action = "down" if state else "up"
                    payload = {
                        "type": "input",
                        "action": action,
                        "key": name,
                        "device": device,
                        "time": now,
                    }
                    await event_queue.put(payload)

            await asyncio.sleep(poll_interval)
        except asyncio.CancelledError:
            break
        except Exception:
            await asyncio.sleep(0.01)


async def broadcaster_loop():
    """Streams input events to connected overlay clients."""
    while True:
        try:
            event = await event_queue.get()
            if not connected_clients:
                continue

            msg = frame_ws_message(json.dumps(event))
            stale = []
            for client in list(connected_clients):
                try:
                    client.write(msg)
                except Exception:
                    stale.append(client)

            for dead in stale:
                connected_clients.discard(dead)

        except asyncio.CancelledError:
            break
        except Exception:
            await asyncio.sleep(0.001)


async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    remote = writer.get_extra_info("peername")
    try:
        req = await reader.read(4096)
        if not req:
            writer.close()
            await writer.wait_closed()
            return

        req_str = req.decode("utf-8", errors="replace")
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

        connected_clients.add(writer)
        welcome = {
            "type": "status",
            "connected": True,
            "version": "1.3.5",
            "isAdmin": is_admin(),
            "engine": "GetAsyncKeyState-Native-Win32",
        }
        writer.write(frame_ws_message(json.dumps(welcome)))
        await writer.drain()
        print(f"  [Overlay Connected] Active link from {remote}")

        while True:
            head = await reader.read(2)
            if not head or len(head) < 2:
                break
            opcode = head[0] & 0x0F
            if opcode == 0x8:
                break

            b2 = head[1]
            masked = bool(b2 & 0x80)
            payload_len = b2 & 0x7F
            if payload_len == 126:
                ext = await reader.read(2)
                payload_len = struct.unpack("!H", ext)[0]
            elif payload_len == 127:
                ext = await reader.read(8)
                payload_len = struct.unpack("!Q", ext)[0]

            if masked:
                await reader.read(4)
            await reader.read(payload_len)

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
        print(f"  [Overlay Disconnected] from {remote}")


async def main():
    ensure_admin()

    admin_status = "ENABLED (Full In-Game Capture)" if is_admin() else "NOT ELEVATED (Desktop only)"

    print("=" * 68)
    print("  Where Winds Meet — Calculator & Rotation Trainer (All-in-One)")
    print("=" * 68)
    print(f"  [Web App]      http://{HTTP_HOST}:{HTTP_PORT}")
    print(f"  [Companion]    ws://{WS_HOST}:{WS_PORT}")
    print(f"  [Admin Rights] {admin_status}")
    print("  [Input Engine] Native Win32 (GetAsyncKeyState 250Hz + RawInput)")
    print("  [Assets]       " + ("Embedded Bundle" if getattr(sys, "frozen", False) else DIST_DIR))
    print("=" * 68)
    print("  Starting local server & opening application window...")

    # 1. Start HTTP Server serving dist/
    start_http_server(DIST_DIR, HTTP_HOST, HTTP_PORT)
    time.sleep(0.3)

    # 2. Launch App Window (Edge/Chrome in standalone --app mode)
    launch_app_window(f"http://{HTTP_HOST}:{HTTP_PORT}")

    # 3. Start Companion WebSocket Server
    server = await asyncio.start_server(handle_client, WS_HOST, WS_PORT)

    loop = asyncio.get_running_loop()
    wheel_thread = threading.Thread(target=mouse_wheel_listener_thread, args=(loop,), daemon=True)
    wheel_thread.start()

    print("\n  [READY] Application window opened!")
    print("  Keep this console window open while playing or practicing.")
    print("  Press Ctrl+C to exit.\n")

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
        print("\nWWM Calculator stopped.")
