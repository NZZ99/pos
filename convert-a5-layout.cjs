const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');

// Replace {printSize === 'A4' ? ( with {printSize === 'A4' || printSize === 'A5' ? (
content = content.replace(
  "{printSize === 'A4' ? (",
  "{printSize === 'A4' || printSize === 'A5' ? ("
);

// Replace the A4 div with dynamic sizing
const oldDiv = `className="bg-white w-[210mm] min-h-[297mm] shrink-0 relative overflow-hidden print:w-[210mm] print:min-w-[210mm] print:max-w-[210mm] print:min-h-[297mm] print:border-none border border-slate-200 shadow-md font-sans text-slate-900 flex flex-col mx-auto"`;
const newDiv = `className={\`bg-white shrink-0 relative overflow-hidden print:border-none border border-slate-200 shadow-md font-sans text-slate-900 flex flex-col mx-auto \${
                  printSize === 'A4' 
                    ? 'w-[210mm] min-h-[297mm] print:w-[210mm] print:min-w-[210mm] print:max-w-[210mm] print:min-h-[297mm]' 
                    : 'w-[148.5mm] min-h-[210mm] print:w-[148.5mm] print:min-w-[148.5mm] print:max-w-[148.5mm] print:min-h-[210mm]'
                }\`}`;
content = content.replace(oldDiv, newDiv);

// Scale fonts for A5
const fontScaleMap = [
  { old: 'text-3xl', new: '${printSize === \\\'A5\\\' ? \\\'text-2xl\\\' : \\\'text-3xl\\\'}' },
  { old: 'text-4xl', new: '${printSize === \\\'A5\\\' ? \\\'text-3xl\\\' : \\\'text-4xl\\\'}' },
  { old: 'text-lg', new: '${printSize === \\\'A5\\\' ? \\\'text-base\\\' : \\\'text-lg\\\'}' },
  { old: 'text-base', new: '${printSize === \\\'A5\\\' ? \\\'text-sm\\\' : \\\'text-base\\\'}' },
];

content = content.replace(
  `h-full p-10 sm:p-14 print:p-12`,
  `h-full \${printSize === 'A5' ? 'p-6 sm:p-8 print:p-8' : 'p-10 sm:p-14 print:p-12'}`
);

content = content.replace(
  `text-3xl font-bold text-[#333B4F] tracking-tight`,
  `\${printSize === 'A5' ? 'text-xl' : 'text-3xl'} font-bold text-[#333B4F] tracking-tight`
);

content = content.replace(
  `text-sm text-slate-500 font-medium tracking-widest uppercase`,
  `\${printSize === 'A5' ? 'text-xs' : 'text-sm'} text-slate-500 font-medium tracking-widest uppercase`
);

content = content.replace(
  `text-4xl font-light text-[#333B4F] tracking-widest mb-4`,
  `\${printSize === 'A5' ? 'text-2xl' : 'text-4xl'} font-light text-[#333B4F] tracking-widest \${printSize === 'A5' ? 'mb-2' : 'mb-4'}`
);

content = content.replace(
  `<div className="flex justify-between items-start mb-10">`,
  `<div className={\`flex justify-between items-start \${printSize === 'A5' ? 'mb-6' : 'mb-10'}\`}>`
);

content = content.replace(
  `<div className="flex justify-between mb-10 items-end">`,
  `<div className={\`flex justify-between \${printSize === 'A5' ? 'mb-6' : 'mb-10'} items-end\`}>`
);

content = content.replace(
  `<p className="font-bold text-[#333B4F] text-lg">`,
  `<p className={\`font-bold text-[#333B4F] \${printSize === 'A5' ? 'text-base' : 'text-lg'}\`}>`
);

content = content.replace(
  `<div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">`,
  `<div className={\`grid grid-cols-2 \${printSize === 'A5' ? 'gap-x-4 gap-y-2 text-sm' : 'gap-x-8 gap-y-3 text-base'}\`}>`
);

content = content.replace(
  `<table className="w-full text-base border-collapse border border-[#333B4F]">`,
  `<table className={\`w-full border-collapse border border-[#333B4F] \${printSize === 'A5' ? 'text-sm' : 'text-base'}\`}>`
);

content = content.replace(
  `const handlePrint = () => {`,
  `const handlePrint = () => {`
);

content = content.replace(
  `<p className="font-bold text-slate-800 text-base mb-2">Payment Info:</p>`,
  `<p className={\`font-bold text-slate-800 mb-2 \${printSize === 'A5' ? 'text-sm' : 'text-base'}\`}>Payment Info:</p>`
);

content = content.replace(
  `<div className="text-sm text-slate-600 space-y-1">`,
  `<div className={\`text-slate-600 space-y-1 \${printSize === 'A5' ? 'text-xs' : 'text-sm'}\`}>`
);

content = content.replace(
  `<div className="text-right text-[#333B4F] space-y-4">`,
  `<div className={\`text-right text-[#333B4F] \${printSize === 'A5' ? 'space-y-2 text-sm' : 'space-y-4 text-base'}\`}>`
);

fs.writeFileSync('src/components/VoucherModal.tsx', content);
