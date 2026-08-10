const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');

content = content.replace(
  /'w-\[210mm\] min-h-\[297mm\] print:w-\[210mm\] print:min-w-\[210mm\] print:max-w-\[210mm\] print:min-h-0 print:h-auto'/g,
  "'w-[210mm] min-h-[297mm] print:w-[210mm] print:min-w-[210mm] print:max-w-[210mm] print:h-[297mm] print:overflow-hidden'"
);

content = content.replace(
  /'w-\[105mm\] min-h-\[150mm\] print:w-\[105mm\] print:min-w-\[105mm\] print:max-w-\[105mm\] print:min-h-0 print:h-auto'/g,
  "'w-[105mm] h-[150mm] print:w-[105mm] print:min-w-[105mm] print:max-w-[105mm] print:h-[150mm] print:overflow-hidden'"
);

fs.writeFileSync('src/components/VoucherModal.tsx', content);
