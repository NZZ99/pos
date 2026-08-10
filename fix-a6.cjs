const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');

// Change references from A5 to A6
content = content.replace(/A5/g, 'A6');

// Change dimensions for A6 to 105mm x 150mm
content = content.replace(/148.5mm 210mm/g, '105mm 150mm');
content = content.replace(/148.5x210mm/g, '10.5x15cm');
content = content.replace(/w-\[148.5mm\]/g, 'w-[105mm]');
content = content.replace(/min-h-\[210mm\]/g, 'min-h-[150mm]');
content = content.replace(/max-w-\[148.5mm\]/g, 'max-w-[105mm]');
content = content.replace(/min-w-\[148.5mm\]/g, 'min-w-[105mm]');

// Adjust empty rows logic so that A6 doesn't render any empty rows, or maybe just max(0, 4 - sale.items.length) 
content = content.replace(
  "{[...Array(Math.max(1, 12 - sale.items.length))].map((_, i) => (",
  "{printSize !== 'A6' && [...Array(Math.max(1, 12 - sale.items.length))].map((_, i) => ("
);

// We should also adjust font sizes and paddings further if 10.5x15cm is much smaller
content = content.replace(/p-6 sm:p-8 print:p-8/g, 'p-4 sm:p-6 print:p-4');
content = content.replace(/mb-6/g, 'mb-4');
content = content.replace(/gap-x-4 gap-y-2/g, 'gap-x-2 gap-y-1');

// Adjust the invoice h1 and h2
content = content.replace(/text-xl/g, 'text-lg');
content = content.replace(/text-2xl/g, 'text-xl');

fs.writeFileSync('src/components/VoucherModal.tsx', content);
