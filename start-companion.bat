@echo off
title WWM Rotation Trainer Companion
cd /d "%~dp0"
cls
echo ==============================================================
echo    Where Winds Meet - Rotation Trainer Companion
echo ==============================================================
echo.

:: 1. If standalone .exe is available, launch it directly (no Python needed)
if exist "%~dp0WWM-Companion.exe" (
    echo Starting standalone WWM-Companion.exe...
    start "" "%~dp0WWM-Companion.exe"
    exit /b
)
if exist "%~dp0dist\WWM-Companion.exe" (
    echo Starting standalone WWM-Companion.exe...
    start "" "%~dp0dist\WWM-Companion.exe"
    exit /b
)
if exist "%~dp0public\downloads\WWM-Companion.exe" (
    echo Starting standalone WWM-Companion.exe...
    start "" "%~dp0public\downloads\WWM-Companion.exe"
    exit /b
)

:: 2. Try Python launchers
echo Launching companion service via Python...
set PYTHONUNBUFFERED=1

:: Auto-install dependencies if python is available
python -c "import keyboard, websockets" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Checking/installing required packages (websockets, keyboard)...
    pip install --quiet websockets keyboard 2>nul
)

if exist "%~dp0companion\companion_server.py" (
    python "%~dp0companion\companion_server.py"
) else if exist "%~dp0companion_server.py" (
    python "%~dp0companion_server.py"
) else (
    echo [Error] companion_server.py not found!
    pause
)
