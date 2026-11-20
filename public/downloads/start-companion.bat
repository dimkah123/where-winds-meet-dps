@echo off
title WWM Rotation Trainer Companion
cls
echo ==============================================================
echo    Where Winds Meet - Rotation Trainer Companion
echo ==============================================================
echo.
echo Starting local companion service...
python "%~dp0companion\companion_server.py"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [Notice] Python exited with error code %ERRORLEVEL%.
    pause
)
