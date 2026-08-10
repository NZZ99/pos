const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');

// Fix className="... ${...} ..."
content = content.replace(/className="([^"]*)\$\{([^}]*)\}([^"]*)"/g, "className={`$1\\${$2}$3`}");

fs.writeFileSync('src/components/VoucherModal.tsx', content);
