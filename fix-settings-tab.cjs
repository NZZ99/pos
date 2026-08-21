const fs = require('fs');

let content = fs.readFileSync('src/components/SettingsTab.tsx', 'utf-8');

// 1. Add imports
content = content.replace(
  /import React, \{ useState \} from 'react';/,
  "import React, { useState, useEffect } from 'react';"
);
content = content.replace(
  /Tag,/g,
  "Tag,\n  Lock,"
);
content = content.replace(
  /import \{ ShopInfo, TabLabels \} from '\.\.\/types';/g,
  "import { ShopInfo, TabLabels } from '../types';\nimport { SettingsPinLock } from './SettingsPinLock';"
);

// 2. Add state and effect
const stateToAdd = `
  const [shopForm, setShopForm] = useState<ShopInfo>({ ...shopInfo });
  const [labelForm, setLabelForm] = useState<TabLabels>({ ...tabLabels });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pinLock, setPinLock] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    const savedPin = localStorage.getItem('cs_pos_v5_settings_pin');
    if (savedPin) {
      setPinLock(savedPin);
      setNewPin(savedPin);
      setIsUnlocked(false);
    } else {
      setIsUnlocked(true);
    }
  }, []);

  if (!isUnlocked && pinLock) {
    return <SettingsPinLock correctPin={pinLock} onUnlock={() => setIsUnlocked(true)} />;
  }
`;

content = content.replace(
  /const \[shopForm, setShopForm\] = useState<ShopInfo>\(\{ \.\.\.shopInfo \}\);\s*const \[labelForm, setLabelForm\] = useState<TabLabels>\(\{ \.\.\.tabLabels \}\);\s*const \[savedSuccess, setSavedSuccess\] = useState\(false\);/,
  stateToAdd
);

// 3. Update handleSave
const handleSaveNew = `
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPin.length > 0 && newPin.length !== 6) {
      alert('PIN code ပြောင်းရန် ဂဏန်း ၆ လုံး တိတိထည့်ပါ သို့မဟုတ် ဖယ်ရှားရန် အလွတ်ထားပါ။');
      return;
    }

    onSaveShopInfo(shopForm);
    onSaveTabLabels(labelForm);
    
    if (newPin.length === 6) {
      localStorage.setItem('cs_pos_v5_settings_pin', newPin);
      setPinLock(newPin);
    } else if (newPin.length === 0) {
      localStorage.removeItem('cs_pos_v5_settings_pin');
      setPinLock(null);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };
`;

content = content.replace(
  /const handleSave = \(e: React.FormEvent\) => \{[\s\S]*?setTimeout\(\(\) => setSavedSuccess\(false\), 3000\);\s*\};/,
  handleSaveNew
);

// 4. Add security section before save button
const securitySection = `
        {/* Section 3: Security Customization */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">
              လုံခြုံရေး (Security PIN)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            ပြင်ဆင်ရန် (Settings) ကို တခြားသူများ မဝင်ရောက်နိုင်ရန် PIN (ဂဏန်း ၆ လုံး) သတ်မှတ်နိုင်ပါသည်။ ပယ်ဖျက်လိုပါက အလွတ်ထားပြီး သိမ်းဆည်းပါ။
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>PIN Code အသစ် (ဂဏန်း ၆ လုံး):</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={newPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setNewPin(val);
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tracking-widest"
                placeholder="ဥပမာ - 123456"
              />
            </div>
          </div>
        </div>

        {/* Action Save Button */}
`;

content = content.replace(
  /\{\/\* Action Save Button \*\/\}/,
  securitySection
);

fs.writeFileSync('src/components/SettingsTab.tsx', content);

