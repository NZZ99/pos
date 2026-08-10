const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');

// Use regex to replace className="${...} ..." with className={`...`}
// Example: className="${printSize === 'A6' ? 'py-1 px-1.5' : 'py-2.5 px-3'} text-left"
content = content.replace(/className="\$\{([^}]*)\}([^"]*)"/g, "className={`\\${$1}$2`}");

fs.writeFileSync('src/components/VoucherModal.tsx', content);
