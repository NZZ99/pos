import React, { useState } from 'react';
import { ShopInfo } from '../types';
import { X, Store, Save } from 'lucide-react';

interface ShopInfoModalProps {
  isOpen: boolean;
  shopInfo: ShopInfo;
  onSave: (info: ShopInfo) => void;
  onClose: () => void;
}

export const ShopInfoModal: React.FC<ShopInfoModalProps> = ({
  isOpen,
  shopInfo,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(shopInfo.name);
  const [tagline, setTagline] = useState(shopInfo.tagline);
  const [address, setAddress] = useState(shopInfo.address);
  const [phone, setPhone] = useState(shopInfo.phone);
  const [voucherNote, setVoucherNote] = useState(shopInfo.voucherNote);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      tagline,
      address,
      phone,
      voucherNote,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            <span>ဆိုင်အချက်အလက် ပြင်ဆင်ရန်</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-600 font-medium mb-1">ဆိုင်အမည် *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              ဆိုင်ဆောင်ပုဒ် (Tagline)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">လိပ်စာ *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">ဖုန်းနံပါတ် *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              ဘောင်ချာအောက်ခြေ စာတမ်း
            </label>
            <textarea
              rows={2}
              value={voucherNote}
              onChange={(e) => setVoucherNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              မလုပ်တော့ပါ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>သိမ်းဆည်းမည်</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
