#!/bin/bash
echo "============================================================"
echo "  အအေးခဲ အသားငါး အရောင်းဆိုင် POS App - Mac/Linux Setup"
echo "============================================================"
echo ""

if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js မရှိသေးပါ! https://nodejs.org မှ ဒေါင်းလုဒ်ဆွဲပြီး သွင်းပေးပါ။"
    exit 1
fi

echo "1. Installing packages..."
npm install

echo "2. Building App..."
npm run build

echo "3. Starting App Server..."
echo "Browser တွင် http://localhost:3000 ပွင့်လာပါမည်။"
open http://localhost:3000 || xdg-open http://localhost:3000
npm run dev
