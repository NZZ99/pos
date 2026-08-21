import React, { useState, useEffect } from 'react';
import { ShopInfo, TabLabels } from '../types';
import { SettingsPinLock } from './SettingsPinLock';
import {
  Settings,
  Store,
  Layout,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Phone,
  MapPin,
  FileText,
  Tag,
  Lock,
} from 'lucide-react';

interface SettingsTabProps {
  shopInfo: ShopInfo;
  onSaveShopInfo: (newInfo: ShopInfo) => void;
  tabLabels: TabLabels;
  onSaveTabLabels: (newLabels: TabLabels) => void;
}

const DEFAULT_TAB_LABELS: TabLabels = {
  pos: 'အရောင်း (POS)',
  products: 'ကုန်ပစ္စည်းများ',
  stockIn: 'ပစ္စည်းအဝင်',
  inventory: 'လက်ရှိစတော့',
  reports: 'အစီရင်ခံစာ',
  settings: 'ပြင်ဆင်ရန် (Settings)',
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
  shopInfo,
  onSaveShopInfo,
  tabLabels,
  onSaveTabLabels,
}) => {
  
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


  const handleResetLabels = () => {
    setLabelForm({ ...DEFAULT_TAB_LABELS });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>စနစ်ပြင်ဆင်ရန် (System Settings)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tab အမည်များနှင့် ဆိုင်အချက်အလက်များကို စိတ်ကြိုက် ပြင်ဆင်ပြောင်းလဲနိုင်ပါသည်။
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>အပြောင်းအလဲများကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Customize Tab Labels */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-base">
                Tab အမည်များ ပြင်ဆင်ရန် (Customize Navigation Tab Labels)
              </h3>
            </div>

            <button
              type="button"
              onClick={handleResetLabels}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>မူလအတိုင်း ပြန်ထားမည်</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            စာမျက်နှာများ၏ အပေါ်ဘက် Tab Navigation များတွင် ပြသလိုသော စာသားအမည်များကို စိတ်ကြိုက် ပြောင်းလဲသတ်မှတ်ပါ -
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>၁။ အရောင်း Tab အမည်:</span>
              </label>
              <input
                type="text"
                value={labelForm.pos}
                onChange={(e) => setLabelForm({ ...labelForm, pos: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>၂။ ကုန်ပစ္စည်း Tab အမည်:</span>
              </label>
              <input
                type="text"
                value={labelForm.products}
                onChange={(e) => setLabelForm({ ...labelForm, products: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>၃။ ပစ္စည်းအဝင် Tab အမည်:</span>
              </label>
              <input
                type="text"
                value={labelForm.stockIn}
                onChange={(e) => setLabelForm({ ...labelForm, stockIn: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>၄။ လက်ရှိစတော့ Tab အမည်:</span>
              </label>
              <input
                type="text"
                value={labelForm.inventory}
                onChange={(e) => setLabelForm({ ...labelForm, inventory: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>၅။ အစီရင်ခံစာ Tab အမည်:</span>
              </label>
              <input
                type="text"
                value={labelForm.reports}
                onChange={(e) => setLabelForm({ ...labelForm, reports: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>၆။ ပြင်ဆင်ရန် Tab အမည်:</span>
              </label>
              <input
                type="text"
                value={labelForm.settings}
                onChange={(e) => setLabelForm({ ...labelForm, settings: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Shop Information Customization */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">
              ဆိုင်အချက်အလက်များ ပြင်ဆင်ရန် (Shop Information & Receipt Header)
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            အောက်ပါ အချက်အလက်များသည် ဘောင်ချာ (Voucher) များနှင့် Excel အစီရင်ခံစာ ခေါင်းစဉ်များတွင် ပေါ်မည်ဖြစ်ပါသည်။
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                <span>ဆိုင်အမည်:</span>
              </label>
              <input
                type="text"
                value={shopForm.name}
                onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. ရွှေအေးခဲအသားစိုက်ဆိုင်"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <span>ဆိုင်ဆောင်ပုဒ် (Tagline):</span>
              </label>
              <input
                type="text"
                value={shopForm.tagline}
                onChange={(e) => setShopForm({ ...shopForm, tagline: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. လတ်ဆတ်သန့်ရှင်းသော အသားစုံ"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>ဖုန်းနံပါတ်:</span>
              </label>
              <input
                type="text"
                value={shopForm.phone}
                onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. 09-123456789"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>လိပ်စာ:</span>
              </label>
              <input
                type="text"
                value={shopForm.address}
                onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. အမှတ် (၁၂)၊ ဗဟန်းမြို့နယ်၊ ရန်ကုန်။"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>ဘောင်ချာအောက်ခြေ နှုတ်ခွန်းဆက်စာသား (Voucher Footer Note):</span>
              </label>
              <input
                type="text"
                value={shopForm.voucherNote}
                onChange={(e) => setShopForm({ ...shopForm, voucherNote: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. ဝယ်ယူအားပေးမှုကို အထူးကျေးဇူးတင်ရှိပါသည်!"
              />
            </div>
          </div>
        </div>

        
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

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>အချက်အလက်များ သိမ်းဆည်းမည်</span>
          </button>
        </div>
      </form>
    </div>
  );
};
