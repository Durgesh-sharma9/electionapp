@echo off
title Mahapura Election Outreach Portal
color 0A
echo =========================================================
echo   महापुरा चुनाव संपर्क एवं मतदाता पोर्टल (Mahapura Election)
echo =========================================================
echo.
echo 1. Starting Backend API on http://localhost:8500 ...
start "Mahapura Backend API (Port 8500)" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 2 /nobreak > nul

echo 2. Starting Frontend Web App on http://localhost:8501 ...
start "Mahapura Frontend React (Port 8501)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 2 /nobreak > nul

echo.
echo =========================================================
echo  PC Browser Link:     http://localhost:8501
echo  Mobile (Wi-Fi) Link:  http://192.168.1.2:8501
echo =========================================================
start http://localhost:8501
pause
