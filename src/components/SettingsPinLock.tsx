import React, { useState } from 'react';
import { Delete } from 'lucide-react';

interface SettingsPinLockProps {
  correctPin: string;
  onUnlock: () => void;
}

export const SettingsPinLock: React.FC<SettingsPinLockProps> = ({ correctPin, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 6) {
        if (newPin === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-transparent">
      {/* Dots Display */}
      <div className={`flex gap-4 mb-16 transition-all ${error ? 'animate-bounce' : ''}`}>
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
      <div className="grid grid-cols-3 gap-x-12 gap-y-8 max-w-xs mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num.toString())}
            className="w-16 h-16 flex items-center justify-center text-3xl font-light text-slate-900 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200 focus:outline-none"
          >
            {num}
          </button>
        ))}
        
        <button
          onClick={handleDelete}
          className="w-16 h-16 flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200 focus:outline-none"
        >
          <Delete className="w-8 h-8" />
        </button>
        
        <button
          onClick={() => handlePress('0')}
          className="w-16 h-16 flex items-center justify-center text-3xl font-light text-slate-900 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200 focus:outline-none"
        >
          0
        </button>
        
        <button
          onClick={handleClear}
          className="w-16 h-16 flex items-center justify-center text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200 focus:outline-none tracking-wider uppercase"
        >
          CLEAR
        </button>
      </div>
    </div>
  );
};
