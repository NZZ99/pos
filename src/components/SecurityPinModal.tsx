import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, Delete, AlertCircle, Eye, EyeOff, Trash2, ShieldAlert } from 'lucide-react';

interface SecurityPinModalProps {
  isOpen: boolean;
  correctPin: string;
  accountPassword?: string;
  title?: string;
  description?: string;
  actionType?: 'delete' | 'confirm';
  onSuccess: () => void;
  onClose: () => void;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  correctPin,
  accountPassword = '',
  title = 'လုံခြုံရေး အတည်ပြုပါ',
  description = 'ဤလုပ်ဆောင်ချက်ကို ဆက်လက်လုပ်ဆောင်ရန် သင့် Login Password သို့မဟုတ် Security PIN ကို ထည့်သွင်းပေးပါ။',
  actionType = 'delete',
  onSuccess,
  onClose,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputVal('');
      setShowPassword(false);
      setError(false);
      setErrorMessage('');
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validTargets = [correctPin, accountPassword, '123456']
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p && p.length > 0));

  const handleVerify = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError(true);
      setErrorMessage('Password သို့မဟုတ် PIN ကို အရင်ရိုက်ထည့်ပေးပါ။');
      inputRef.current?.focus();
      return;
    }

    const isMatch = validTargets.some((target) => target === trimmed);

    if (isMatch) {
      setError(false);
      setErrorMessage('');
      onSuccess();
    } else {
      setError(true);
      setErrorMessage('Password (သို့မဟုတ် PIN) မှားယွင်းနေပါသည်။ ပြန်လည်စစ်ဆေးပြီး ရိုက်ထည့်ပါ။');
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  const handleNumpadPress = (digit: string) => {
    setInputVal((prev) => prev + digit);
    setError(false);
    setErrorMessage('');
  };

  const handleBackspace = () => {
    setInputVal((prev) => prev.slice(0, -1));
    setError(false);
    setErrorMessage('');
  };

  const handleClear = () => {
    setInputVal('');
    setError(false);
    setErrorMessage('');
  };

  const isDelete = actionType === 'delete';

  return (
    <div
      id="security-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="security-modal-box"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 sm:p-6 relative flex flex-col items-center animate-in zoom-in-95 duration-150"
      >
        {/* Close Top Button */}
        <button
          id="security-modal-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="ပိတ်မည်"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Icon */}
        <div
          className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${
            isDelete
              ? 'bg-rose-100 text-rose-600 border border-rose-200'
              : 'bg-indigo-100 text-indigo-600 border border-indigo-200'
          }`}
        >
          {isDelete ? <Trash2 className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-800 text-center mb-1">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 text-center mb-4 leading-relaxed px-1">
          {description}
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="security-password-input"
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setError(false);
                setErrorMessage('');
              }}
              placeholder="Password (သို့) PIN ရိုက်ထည့်ပါ..."
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-all ${
                error
                  ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title={showPassword ? 'Password ဖျောက်မည်' : 'Password ကြည့်မည်'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Numpad for Mobile / Touch Convenience */}
          <div className="pt-1">
            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mx-auto mb-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumpadPress(num.toString())}
                  className="h-10 flex items-center justify-center text-lg font-bold text-slate-800 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                className="h-10 flex items-center justify-center text-[11px] font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                CLEAR
              </button>

              <button
                type="button"
                onClick={() => handleNumpadPress('0')}
                className="h-10 flex items-center justify-center text-lg font-bold text-slate-800 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="h-10 flex items-center justify-center text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all active:scale-95 cursor-pointer"
                title="တစ်ခုဖျက်မည်"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              id="security-modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>

            <button
              id="security-modal-confirm-btn"
              type="submit"
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl text-white shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer ${
                isDelete
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              {isDelete ? <Trash2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>Enter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
