const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');

// Fix w-12
content = content.replace(
  /\$\{printSize === 'A6' \? 'py-1 px-1\.5' : 'py-2\.5 px-3'\} text-left font-semibold border-r border-\[#333B4F\] w-12/g,
  "${printSize === 'A6' ? 'py-1 px-1.5 w-6' : 'py-2.5 px-3 w-12'} text-left font-semibold border-r border-[#333B4F]"
);

// Fix w-20
content = content.replace(
  /\$\{printSize === 'A6' \? 'py-1 px-1\.5' : 'py-2\.5 px-3'\} text-center font-semibold border-r border-\[#333B4F\] w-20/g,
  "${printSize === 'A6' ? 'py-1 px-1.5 w-10' : 'py-2.5 px-3 w-20'} text-center font-semibold border-r border-[#333B4F]"
);

// Fix w-32 for Price
content = content.replace(
  /\$\{printSize === 'A6' \? 'py-1 px-1\.5' : 'py-2\.5 px-3'\} text-center font-semibold border-r border-\[#333B4F\] w-32/g,
  "${printSize === 'A6' ? 'py-1 px-1.5 w-16' : 'py-2.5 px-3 w-32'} text-center font-semibold border-r border-[#333B4F]"
);

// Fix w-32 for Total
content = content.replace(
  /\$\{printSize === 'A6' \? 'py-1 px-1\.5' : 'py-2\.5 px-3'\} text-center font-semibold w-32/g,
  "${printSize === 'A6' ? 'py-1 px-1.5 w-16' : 'py-2.5 px-3 w-32'} text-center font-semibold"
);

// Fix the style block to ensure A6 is only 1 page
content = content.replace(
  /margin: 0mm;\s*\n\s*\}\s*\n\s*\}\s*\n\s*`\}/g,
  `margin: 0mm;
            }
            html, body {
              \${printSize === 'A6' ? 'width: 105mm; height: 150mm; overflow: hidden !important;' : ''}
            }
          }
        \`}
`
);

fs.writeFileSync('src/components/VoucherModal.tsx', content);
