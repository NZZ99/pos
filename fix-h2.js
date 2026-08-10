const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');
const lines = content.split('\n');
lines[152] = "                     <h2 className={`\\${printSize === 'A5' ? 'text-2xl' : 'text-4xl'} font-light text-[#333B4F] tracking-widest \\${printSize === 'A5' ? 'mb-2' : 'mb-4'}`}>INVOICE</h2>";
fs.writeFileSync('src/components/VoucherModal.tsx', lines.join('\n'));
