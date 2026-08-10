const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');

// 1. Remove size for 80mm
content = content.replace(
  /size: \$\{printSize === 'A4' \? 'A4 portrait' : printSize === 'A6' \? '105mm 150mm' : '80mm auto'\};/g,
  "${printSize === 'A4' ? 'size: A4 portrait;' : printSize === 'A6' ? 'size: 105mm 150mm;' : ''}"
);

// 2. Fix container width for 80mm
content = content.replace(
  /className="bg-white text-slate-900 shadow-md border border-slate-200 p-4 print:p-1 print:border-none print:shadow-none transition-all w-\[320px\] print:w-\[72mm\] print:min-w-\[72mm\] print:max-w-\[72mm\] font-sans text-xs print:text-\[11px\] leading-normal mx-auto print:mx-0"/g,
  'className="bg-white text-slate-900 shadow-md border border-slate-200 p-4 print:p-0 print:border-none print:shadow-none transition-all w-[320px] print:w-full print:max-w-full font-sans text-xs print:text-[11px] leading-normal mx-auto"'
);

fs.writeFileSync('src/components/VoucherModal.tsx', content);
