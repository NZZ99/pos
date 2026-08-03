@echo off
chcp 65001 >nul
title အအေးခဲ POS System - 1-Click Offline App
color 0B
cls
echo ============================================================
echo   အအေးခဲ အသားငါး အရောင်းဆိုင် POS System (Offline Ready)
echo ============================================================
echo.

set "DIST_FILE=%~dp0dist\index.html"

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [အသိပေးချက်] Node.js မရှိသေးပါ - Browser ဖြင့် တိုက်ရိုက် ဖွင့်လှစ်ပေးပါမည်...
    echo.
    if exist "%DIST_FILE%" (
        start "" "%DIST_FILE%"
    ) else (
        start "" "%~dp01-CLICK-OPEN.html"
    )
    timeout /t 3 >nul
    exit /b
)

echo [1/2] Node.js စစ်ဆေးပြီးပါပြီ... (OK)
echo.

:: 2. Check build folder
if not exist "%DIST_FILE%" (
    echo [2/2] App ဖိုင်များ ပထမဆုံးအကြိမ် ပြင်ဆင်နေပါသည် (၁ ကြိမ်သာ စောင့်ပေးပါ)...
    call npm install
    call npm run build
    echo.
)

echo [2/2] POS App ကို စတင် မောင်းနှင်နေပါသည်...
echo http://localhost:3000 ကို Browser တွင် အလိုအလျောက် ပွင့်လာပါမည်။
echo.
cd /d "%~dp0"
node server.cjs

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [အမှား] Server မောင်းနှင်ရာတွင် အခက်အခဲရှိသဖြင့် Browser ဖြင့် တိုက်ရိုက် ဖွင့်ပါမည်...
    start "" "%DIST_FILE%"
)

pause
