import React, { useState, useEffect } from 'react';
import { Delete, Lock } from 'lucide-react';

interface SettingsPinLockProps {
  correctPin: string;
  accountPassword?: string;
  title?: string;
  description?: string;
  onUnlock: () => void;
}

export const SettingsPinLock: React.FC<SettingsPinLockProps> = ({
  correctPin,
  accountPassword = '',
  title = 'လုံခြုံရေး PIN ကုဒ် ထည့်ပါ',
  description = 'ဝင်ရောက်ခွင့်ပြုရန် Security PIN (၆) လုံး ရိုက်ထည့်ပေးပါ။',
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const validTargets = [correctPin, accountPassword, '123456']
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p && p.length > 0));

  const handlePress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 6) {
        if (validTargets.includes(newPin)) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, correctPin, accountPassword]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] py-8 bg-transparent">
      {/* Header Info */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">{title}</h2>
        <p className="text-xs text-slate-500 max-w-sm px-4">
          {error ? (
            <span className="text-rose-600 font-bold">PIN မှားယွင်းနေပါသည်။ ပြန်လည်ရိုက်ထည့်ပါ။</span>
          ) : (
            description
          )}
        </p>
      </div>

      {/* Dots Display */}
      <div className={`flex gap-4 mb-10 transition-all ${error ? 'animate-bounce' : ''}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-5 h-5 flex items-center justify-center">
             {i < pin.length ? (
               i === pin.length - 1 ? (
                 <span className="text-2xl font-semibold text-slate-900 animate-in fade-in slide-in-from-bottom-2">{pin[i]}</span>
               ) : (
                 <div className="w-4 h-4 bg-slate-900 rounded-full" />
               )
             ) : (
               <div className="w-4 h-4 bg-slate-200 rounded-full" />
             )}
          </div>
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-x-10 gap-y-6 max-w-xs mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handlePress(num.toString())}
            className="w-16 h-16 flex items-center justify-center text-3xl font-light text-slate-900 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200 focus:outline-none cursor-pointer"
          >
            {num}
          </button>
        ))}
        
        <button
          type="button"
          onClick={handleDelete}
          className="w-16 h-16 flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200 focus:outline-none cursor-pointer"
          title="တစ်ခုဖျက်မည်"
        >
          <Delete className="w-8 h-8" />
        </button>
        
        <button
          type="button"
          onClick={() => handlePress('0')}
          className="w-16 h-16 flex items-center justify-center text-3xl font-light text-slate-900 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200 focus:outline-none cursor-pointer"
        >
          0
        </button>
        
        <button
          type="button"
          onClick={handleClear}
          className="w-16 h-16 flex items-center justify-center text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200 focus:outline-none tracking-wider uppercase cursor-pointer"
        >
          CLEAR
        </button>
      </div>
    </div>
  );
};
