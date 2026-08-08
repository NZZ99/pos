import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, CheckSquare, Square, RefreshCw, LogIn, UserPlus } from 'lucide-react';
import { User } from '../types';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing local users or initialize with default
  const getLocalUsers = (): Record<string, string> => {
    const saved = localStorage.getItem('cs_pos_v5_local_users');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default user
    const defaultUsers = { 'admin@gmail.com': 'password123' };
    localStorage.setItem('cs_pos_v5_local_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail) {
      setError('Email ကို ထည့်သွင်းပေးပါ။');
      return;
    }
    if (!password) {
      setError('စကားဝှက် (Password) ထည့်သွင်းပေးပါ။');
      return;
    }

    const encodedEmail = cleanEmail.replace(/[^a-zA-Z0-9_]/g, '_');
    
    try {
      const userRef = doc(db, 'users', encodedEmail);
      const userSnap = await getDoc(userRef);
      
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('စကားဝှက်များ တူညီမှုမရှိပါ။');
          return;
        }
        if (password.length < 6) {
          setError('စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။');
          return;
        }
        
        const existingPassword = userSnap.exists() ? userSnap.data().password : null;
        
        if (existingPassword && existingPassword !== 'google-oauth-session') {
          setError('ဤ Email ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်နေသည်။');
          return;
        }

        // Save new user to Firestore
        await setDoc(userRef, { password }, { merge: true });
        
        // Also save to local storage for fallback
        const users = getLocalUsers();
        users[cleanEmail] = password;
        localStorage.setItem('cs_pos_v5_local_users', JSON.stringify(users));

        setSuccess('အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။');
        setTimeout(() => {
          setIsSignUp(false);
          setPassword('');
          setConfirmPassword('');
        }, 1500);
      } else {
        // Login
        let storedPassword = null;
        
        if (userSnap.exists()) {
          storedPassword = userSnap.data().password;
        }
        
        // Fallback to local storage if not in Firestore (migration)
        if (!storedPassword) {
          const users = getLocalUsers();
          storedPassword = users[cleanEmail];
          // If we found it in local storage but not Firestore, migrate it to Firestore
          if (storedPassword) {
            await setDoc(userRef, { password: storedPassword }, { merge: true }).catch(console.error);
          }
        }

        if (!storedPassword || storedPassword !== password) {
          if (storedPassword === 'google-oauth-session') {
            setError('ဤအကောင့်သည် ယခင်က Google ဖြင့်ဝင်ရောက်ခဲ့ပါသည်။ စကားဝှက်အသစ်သတ်မှတ်ရန် Sign Up ပြန်လုပ်ပေးပါ။');
          } else {
            setError('Email သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။');
          }
          return;
        }

        // Success
        const loggedUser: User = {
          id: `u-${Date.now()}`,
          email: cleanEmail,
          fullName: cleanEmail.split('@')[0],
        };
        setSuccess('စနစ်ထဲသို့ ဝင်ရောက်နေပါသည်...');
        setTimeout(() => {
          onLoginSuccess(loggedUser);
        }, 1000);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError('ဆက်သွယ်မှု အမှားအယွင်းဖြစ်နေပါသည်။');
    }
  };


  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#D3EFE0] select-none">
      {/* Hand-drawn look Vegetable background elements (outlined SVGs) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.12] grid grid-cols-4 sm:grid-cols-6 gap-16 p-8">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="flex items-center justify-center transform rotate-[15deg] even:rotate-[-10deg]">
            {i % 4 === 0 && (
              <svg className="w-16 h-16 text-emerald-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                {/* Carrot */}
                <path d="M5 19L19 5M12 12l2 2m-4-4l2 2m5-7s2-2 3-1-1 3-1 3m-2.5-1.5l1.5-1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {i % 4 === 1 && (
              <svg className="w-16 h-16 text-emerald-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                {/* Apple / Tomato */}
                <path d="M12 21a6 6 0 100-12 6 6 0 000 12zM12 9c0-1.5 1-3 2-3M12 9c0-1.5-1-3-2-3" strokeLinecap="round"/>
              </svg>
            )}
            {i % 4 === 2 && (
              <svg className="w-16 h-16 text-emerald-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                {/* Pepper */}
                <path d="M12 7c-2.5 0-5 1.5-5 5s2.5 5 5 5 5-1.5 5-5-2.5-5-5-5zM12 7V4M10 4h4" strokeLinecap="round"/>
              </svg>
            )}
            {i % 4 === 3 && (
              <svg className="w-16 h-16 text-emerald-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                {/* Leaf */}
                <path d="M12 3v18M12 3c4 0 7 4 7 9s-3 9-7 9M12 3C8 3 5 7 5 12s3 9 7 9M12 7h5M12 12h6M12 17h5M7 7h5M6 12h6M7 17h5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Decorative leafy plants on corners */}
      <div className="absolute top-0 left-0 w-32 h-32 text-emerald-800 opacity-20 pointer-events-none transform -translate-x-6 -translate-y-6">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M0 0c30 0 50 20 50 50S20 100 0 100V0zm20 10c10 10 15 25 15 40s-5 30-15 40V10z" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 text-emerald-800 opacity-20 pointer-events-none transform translate-x-6 translate-y-6">
        <svg viewBox="0 0 100 100" fill="currentColor" className="rotate-180">
          <path d="M0 0c30 0 50 20 50 50S20 100 0 100V0zm20 10c10 10 15 25 15 40s-5 30-15 40V10z" />
        </svg>
      </div>

      {/* Main Container Mockup */}
      <div className="w-full max-w-[380px] bg-[#E8F8EE] rounded-[32px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(16,80,45,0.15)] border-4 border-white relative z-10 flex flex-col justify-between">
        
        {/* Card Header */}
        <div className="text-center mt-2 mb-6">
          <h2 className="text-[28px] font-extrabold text-[#0D5C1E] tracking-tight leading-none mb-1">
            {isSignUp ? 'Sign up' : 'Log in'}
          </h2>
          <p className="text-xs text-[#4F8D5D] font-medium tracking-wide">
            Fresh Food Delivered.
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 bg-rose-100/80 border border-rose-300 text-rose-800 text-xs px-3 py-2 rounded-xl text-center font-semibold">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-100/95 border border-emerald-300 text-[#0D5C1E] text-xs px-3 py-2 rounded-xl text-center font-bold">
            ✨ {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#4F8D5D] ml-1">Email</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#4F8D5D]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@gmail.com"
                className="w-full pl-10 pr-4 py-3 bg-[#F6FCF8] hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border border-[#CEEAD6] focus:border-[#4F8D5D] rounded-2xl outline-none transition-all shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#4F8D5D] ml-1">Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#4F8D5D]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#F6FCF8] hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border border-[#CEEAD6] focus:border-[#4F8D5D] rounded-2xl outline-none transition-all shadow-2xs font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#4F8D5D] hover:text-[#0D5C1E] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Sign up Only) */}
          {isSignUp && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-[11px] font-bold text-[#4F8D5D] ml-1">Confirm password</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#4F8D5D]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#F6FCF8] hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border border-[#CEEAD6] focus:border-[#4F8D5D] rounded-2xl outline-none transition-all shadow-2xs font-medium"
                />
              </div>
            </div>
          )}

          {/* Remember Me & Forget Password (Log in Only) */}
          {!isSignUp && (
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#4F8D5D] px-1 pt-1">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-[#0D5C1E] transition-colors"
              >
                {rememberMe ? (
                  <CheckSquare className="w-4 h-4 text-[#0D5C1E] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-[#4F8D5D] shrink-0" />
                )}
                <span>Remember me</span>
              </button>
              <button
                type="button"
                onClick={() => setError('Password ပြန်လည်ရယူရန် Admin ထံ ဆက်သွယ်ပါ။')}
                className="hover:text-[#0D5C1E] transition-colors"
              >
                Forget your password
              </button>
            </div>
          )}

          {/* Main Action Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#0D5C1E] hover:bg-[#073F13] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isSignUp ? 'Sign up' : 'Log in'}</span>
          </button>
        </form>



        {/* Footer Link Options */}
        <div className="text-center mt-5 mb-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
            }}
            className="text-[#4F8D5D] hover:text-[#0D5C1E] font-bold transition-all underline decoration-dotted"
          >
            {isSignUp ? 'Already have an account? Log in here!' : "Don't have an account? Register here!"}
          </button>
        </div>

        {/* Brand Bottom Info */}
        <div className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-[#CEEAD6]/50">
          <span className="text-[#0D5C1E]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 20.5c.39.39 1.02.39 1.41 0l2.89-2.89C10.05 18.37 11.01 18.5 12 18.5c4.97 0 9-4.03 9-9h-2c0 3.86-3.14 7-7 7s-7-3.14-7-7 3.14-7 7-7 7 3.14 7 7c0 .54-.06 1.07-.18 1.58l1.86.62c.2-.72.32-1.47.32-2.2 0-4.97-4.03-9-9-9zM12 10.5c.83 0 1.5-.67 1.5-1.5S12.83 7.5 12 7.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5z" />
            </svg>
          </span>
          <span className="font-extrabold text-[#0D5C1E] text-base tracking-wide font-sans italic">
            TCO Fresh
          </span>
        </div>
      </div>


    </div>
  );
};
