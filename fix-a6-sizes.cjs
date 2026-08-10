const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');

// Change A6 table font size
content = content.replace(
  "printSize === 'A6' ? 'text-sm' : 'text-base'",
  "printSize === 'A6' ? 'text-xs' : 'text-base'"
);

// Reduce padding in table cells for A6
content = content.replace(/py-2\.5 px-3/g, "${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2.5 px-3'}");
content = content.replace(/py-4 px-3/g, "${printSize === 'A6' ? 'py-1 px-1.5' : 'py-4 px-3'}");

// Invoice to text sizes
content = content.replace(
  "printSize === 'A6' ? 'text-base' : 'text-lg'",
  "printSize === 'A6' ? 'text-sm' : 'text-lg'"
);

content = content.replace(
  "printSize === 'A6' ? 'gap-x-2 gap-y-1' : 'gap-x-8 gap-y-3 text-base'",
  "printSize === 'A6' ? 'gap-x-2 gap-y-1 text-xs' : 'gap-x-8 gap-y-3 text-base'"
);

// Also change the flex container that wraps the subtotal to reduce spacing
content = content.replace(
  "flex-1 pt-6 pr-4",
  "${printSize === 'A6' ? 'flex-1 pt-2 pr-2' : 'flex-1 pt-6 pr-4'}"
);

// Reduce footer paddings
content = content.replace(
  "className=\"py-2 px-3 flex justify-between",
  "className={`flex justify-between ${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2 px-3'}"
);

content = content.replace(
  "py-2 px-3 font-semibold",
  "${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2 px-3'} font-semibold"
);

// We need to also reduce margin-bottoms for A6
content = content.replace(
  "printSize === 'A6' ? 'mb-4' : 'mb-10'",
  "printSize === 'A6' ? 'mb-2' : 'mb-10'"
);
content = content.replace(
  "printSize === 'A6' ? 'mb-6' : 'mb-10'",
  "printSize === 'A6' ? 'mb-3' : 'mb-10'"
);

// Reduce top p-4 sm:p-8 for A6
content = content.replace(
  "printSize === 'A6' ? 'p-4 sm:p-6 print:p-4' : 'p-10 sm:p-14 print:p-12'",
  "printSize === 'A6' ? 'p-4 print:p-4' : 'p-10 sm:p-14 print:p-12'"
);

fs.writeFileSync('src/components/VoucherModal.tsx', content);
