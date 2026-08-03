@echo off
title အအေးခဲ POS System - 1-Click Start
color 0B
cls
echo ============================================================
echo   အအေးခဲ အသားငါး အရောင်းဆိုင် POS System (Offline Ready)
echo ============================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [အသိပေးချက်] PC တွင် Node.js မရှိပါက dist\index.html ကို တိုက်ရိုက် Double-click နှိပ်၍ သုံးနိုင်ပါသည်!
    echo.
    start dist\index.html
    exit /b
)

if exist "dist\index.html" (
    echo POS App ကို စတင်နေပါသည်...
    node server.cjs
) else (
    echo App Files များကို ပြင်ဆင်နေပါသည် (၁ ကြိမ်သာ) ...
    call npm install
    call npm run build
    echo.
    echo POS App ကို စတင်နေပါသည်...
    node server.cjs
)
