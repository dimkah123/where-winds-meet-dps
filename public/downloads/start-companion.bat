@echo off
title WWM Rotation Trainer Companion
cd /d "%~dp0"
cls
echo ==============================================================
echo    Where Winds Meet - Rotation Trainer Companion
echo ==============================================================
echo.

:: 1. If standalone .exe is available, launch it directly (no Python needed)
if exist "WWM-Companion.exe" (
    echo Starting standalone WWM-Companion.exe...
    start "" "WWM-Companion.exe"
    exit /b
)
if exist "public\downloads\WWM-Companion.exe" (
    echo Starting standalone WWM-Companion.exe...
    start "" "public\downloads\WWM-Companion.exe"
    exit /b
)

:: 2. Try Python launchers
echo Launching companion service via Python...
set PYTHONUNBUFFERED=1

py -3.14 "%~dp0companion\companion_server.py" 2>nul
if %ERRORLEVEL% EQU 0 exit /b

py -3 "%~dp0companion\companion_server.py" 2>nul
if %ERRORLEVEL% EQU 0 exit /b

python "%~dp0companion\companion_server.py"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [Notice] Python exited with error code %ERRORLEVEL%.
    pause
)

