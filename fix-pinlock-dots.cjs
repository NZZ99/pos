const fs = require('fs');

let content = fs.readFileSync('src/components/SettingsPinLock.tsx', 'utf-8');

// Replace the dots display logic
const oldDots = `             {i < pin.length ? (
               <div className="w-4 h-4 bg-slate-900 rounded-full" />
             ) : (
               <div className="w-4 h-4 bg-slate-200 rounded-full" />
             )}`;

const newDots = `             {i < pin.length ? (
               i === pin.length - 1 ? (
                 <span className="text-2xl font-semibold text-slate-900 animate-in fade-in slide-in-from-bottom-2">{pin[i]}</span>
               ) : (
                 <div className="w-4 h-4 bg-slate-900 rounded-full" />
               )
             ) : (
               <div className="w-4 h-4 bg-slate-200 rounded-full" />
             )}`;

content = content.replace(oldDots, newDots);

fs.writeFileSync('src/components/SettingsPinLock.tsx', content);
