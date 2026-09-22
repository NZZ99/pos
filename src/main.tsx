import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function RootApp() {
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global caught error:', event.error);
      setHasError(true);
      setErrorMsg(event.message || 'စနစ်တွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့ပါသည်');
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Global unhandled rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#064E1D', color: '#ffffff', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', overflow: 'hidden' }}>
          <img src="/logo.png" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://i.postimg.cc/QMhhm3bh/Image-20260921-143712-529-removebg-preview.png'; }} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.70) translate(1.2%, 7.6%)' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>စနစ်တွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့ပါသည်</h2>
        <p style={{ fontSize: '13px', color: '#a7f3d0', maxWidth: '400px', marginBottom: '20px', lineHeight: 1.6 }}>
          Browser Cache သို့မဟုတ် Data ဆွဲယူရာတွင် အဆင်မပြေဖြစ်သွားခြင်း ဖြစ်နိုင်ပါသည်။ အောက်ပါခလုတ်ကို နှိပ်၍ ပြန်လည်စတင်နိုင်ပါသည်။
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('cs_pos_v5_current_user');
            window.location.reload();
          }}
          style={{ padding: '10px 24px', background: '#10B981', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
        >
          🔄 စနစ်ကို ပြန်လည်စတင်ရန် (Reload)
        </button>
      </div>
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
