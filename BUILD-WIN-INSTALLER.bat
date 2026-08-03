@echo off
chcp 65001 >nul
title Windows Setup .exe Installer ထုတ်လုပ်ပေးသည့် စနစ်
color 0A
cls
echo ============================================================
echo   အအေးခဲ POS System - Desktop .exe Setup Installer Builder
echo ============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [အမှား] PC တွင် Node.js (LTS Version) သွင်းထားရန် လိုအပ်ပါသည်။
    echo 👉 https://nodejs.org မှ Node.js ကို အရင် install လုပ်ပေးပါ။
    echo.
    pause
    exit /b
)

echo [1/3] Dependencies များကို စစ်ဆေးနေပါသည်...
call npm install

echo [2/3] Web App ကို Build လုပ်နေပါသည်...
call npm run build

echo [3/3] Windows Setup (.exe) Installer ပြုလုပ်နေပါသည်...
call npm run electron:build

echo.
echo ============================================================
echo  အောင်မြင်စွာ Build ပြီးပါပြီ!
echo  release folder ထဲတွင် "အအေးခဲ POS Setup.exe" ကို ရရှိပါမည်။
echo ============================================================
echo.
pause
