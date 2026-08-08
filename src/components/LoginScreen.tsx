import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, CheckSquare, Square, RefreshCw, LogIn, UserPlus } from 'lucide-react';
import { User } from '../types';

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
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('silversrayleigh5130@gmail.com');
  const [isSigningIn, setIsSigningIn] = useState(false);

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

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email ကို ထည့်သွင်းပေးပါ။');
      return;
    }
    if (!password) {
      setError('စကားဝှက် (Password) ထည့်သွင်းပေးပါ။');
      return;
    }

    const users = getLocalUsers();

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('စကားဝှက်များ တူညီမှုမရှိပါ။');
        return;
      }
      if (password.length < 6) {
        setError('စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။');
        return;
      }
      if (users[email.toLowerCase()]) {
        setError('ဤ Email ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်နေသည်။');
        return;
      }

      // Save new user
      users[email.toLowerCase()] = password;
      localStorage.setItem('cs_pos_v5_local_users', JSON.stringify(users));

      setSuccess('အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။');
      setTimeout(() => {
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
      }, 1500);
    } else {
      const storedPassword = users[email.toLowerCase()];
      if (!storedPassword || storedPassword !== password) {
        setError('Email သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။ (Default: admin@gmail.com / password123)');
        return;
      }

      // Success
      const loggedUser: User = {
        id: `u-${Date.now()}`,
        email: email.toLowerCase(),
        fullName: email.split('@')[0],
      };
      setSuccess('စနစ်ထဲသို့ ဝင်ရောက်နေပါသည်...');
      setTimeout(() => {
        onLoginSuccess(loggedUser);
      }, 1000);
    }
  };

  const handleGoogleLogin = (selectedEmail: string) => {
    setIsSigningIn(true);
    setTimeout(() => {
      setIsSigningIn(false);
      setIsGoogleModalOpen(false);

      const loggedUser: User = {
        id: `g-${Date.now()}`,
        email: selectedEmail,
        isGoogleUser: true,
        fullName: selectedEmail.split('@')[0].replace('.', ' '),
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedEmail)}`,
      };

      // Add to local database users list if not exists
      const users = getLocalUsers();
      if (!users[selectedEmail.toLowerCase()]) {
        users[selectedEmail.toLowerCase()] = 'google-oauth-session';
        localStorage.setItem('cs_pos_v5_local_users', JSON.stringify(users));
      }

      onLoginSuccess(loggedUser);
    }, 1500);
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

        {/* Separator OR */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-[#CEEAD6] w-full"></div>
          <span className="absolute bg-[#E8F8EE] px-3 text-[10px] text-[#4F8D5D] font-bold uppercase tracking-wider">
            or
          </span>
        </div>

        {/* Log in with Google Button */}
        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="w-full py-3 bg-white hover:bg-[#F0FAF4] border-2 border-[#A8DBB8] text-[#0D5C1E] text-xs sm:text-sm font-bold rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 shadow-2xs"
        >
          {/* Custom Google "G" Logo Icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.353 0 3.336 2.68 1.34 6.6l3.926 3.165z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.273c0-.818-.073-1.609-.209-2.373H12v4.51h6.445a5.507 5.507 0 0 1-2.39 3.614l3.722 2.882c2.182-2.01 3.445-4.964 3.445-8.633z"
            />
            <path
              fill="#FBBC05"
              d="M5.266 14.235A7.072 7.072 0 0 1 4.91 12c0-.79.132-1.55.356-2.265L1.34 6.57A11.93 11.93 0 0 0 0 12c0 1.95.467 3.79 1.286 5.432l3.98-3.197z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.955-1.077 7.94-2.927l-3.722-2.882c-1.032.69-2.35 1.1-4.218 1.1-3.618 0-6.68-2.44-7.777-5.727L1.264 16.71C3.253 20.655 7.31 23.273 12 24z"
            />
          </svg>
          <span className="font-semibold">{isSignUp ? 'Sign up with google' : 'Log in with google'}</span>
        </button>

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

      {/* Simulated Google Account Selector Modal (Highly interactive Gmail connection) */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 text-center relative">
              <div className="flex justify-center mb-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.1-.13-.2-.27-.2-.42l.01-.21z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Choose an account</h3>
              <p className="text-[11px] text-slate-400 mt-1">to continue to <span className="font-semibold text-emerald-700">TCO Fresh POS</span></p>
            </div>

            {/* List of accounts */}
            <div className="p-4 space-y-2">
              {isSigningIn ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-xs font-semibold text-slate-600">Connecting Google account...</p>
                </div>
              ) : (
                <>
                  {/* Account 1: User's Actual Email from Context */}
                  <button
                    onClick={() => handleGoogleLogin(customGoogleEmail)}
                    className="w-full p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all flex items-center gap-3 text-left cursor-pointer hover:border-slate-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xs">
                      {customGoogleEmail[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {customGoogleEmail.split('@')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{customGoogleEmail}</p>
                    </div>
                  </button>



                  {/* Custom email option */}
                  <div className="p-3 border-t border-slate-100 mt-2 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500">Use another Google Account</p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => {
                          if (customGoogleEmail.includes('@')) {
                            handleGoogleLogin(customGoogleEmail);
                          } else {
                            alert('Email ကို သေချာ ထည့်သွင်းပေးပါ။');
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Sign-in
                      </button>
                    </div>
                  </div>

                  {/* Cancel */}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setIsGoogleModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
