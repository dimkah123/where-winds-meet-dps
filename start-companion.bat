@echo off
title WWM Rotation Trainer Companion
cd /d "%~dp0"
cls

:: Check for Administrator permissions (required to intercept in-game keys in Where Winds Meet)
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [Requesting Administrator privileges for in-game input capture...]
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo ==============================================================
echo    Where Winds Meet - Rotation Trainer Companion
echo    [ADMINISTRATOR: In-game hook enabled]
echo ==============================================================
echo.

:: 1. If standalone .exe is available, launch it directly
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

if exist "%~dp0companion\companion_server.py" (
    python "%~dp0companion\companion_server.py"
) else if exist "%~dp0companion_server.py" (
    python "%~dp0companion_server.py"
) else (
    echo [Error] companion_server.py not found!
    pause
)
