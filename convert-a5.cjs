const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');

// Update state
content = content.replace(
  "const [printSize, setPrintSize] = useState<'80mm' | 'A4'>('80mm');",
  "const [printSize, setPrintSize] = useState<'80mm' | 'A4' | 'A5'>('80mm');"
);

// Update print CSS
content = content.replace(
  "size: ${printSize === 'A4' ? 'A4 portrait' : '80mm auto'};",
  "size: ${printSize === 'A4' ? 'A4 portrait' : printSize === 'A5' ? '148.5mm 210mm' : '80mm auto'};"
);

// Update modal container max-w
content = content.replace(
  "${printSize === 'A4' ? 'max-w-4xl print:max-w-none' : 'max-w-lg print:max-w-none'}",
  "${printSize === 'A4' || printSize === 'A5' ? 'max-w-4xl print:max-w-none' : 'max-w-lg print:max-w-none'}"
);

// Update subtitle
content = content.replace(
  "{printSize === 'A4' ? 'A4 Invoice Size' : '80mm Thermal Receipt Printer Size'}",
  "{printSize === 'A4' ? 'A4 Invoice Size' : printSize === 'A5' ? '148.5x210mm Invoice Size' : '80mm Thermal Receipt Printer Size'}"
);

// Add A5 button
const a4Button = `<button
                type="button"
                onClick={() => setPrintSize('A4')}
                className={\`px-2 py-1 rounded font-medium transition-all cursor-pointer \${
                  printSize === 'A4'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-indigo-200 hover:text-white'
                }\`}
              >
                A4 / Regular
              </button>`;

const a5Button = `<button
                type="button"
                onClick={() => setPrintSize('A5')}
                className={\`px-2 py-1 rounded font-medium transition-all cursor-pointer \${
                  printSize === 'A5'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-indigo-200 hover:text-white'
                }\`}
              >
                148.5x210mm
              </button>`;
content = content.replace(a4Button, a4Button + '\n              ' + a5Button);

fs.writeFileSync('src/components/VoucherModal.tsx', content);
