const fs = require('fs');
let content = fs.readFileSync('src/components/VoucherModal.tsx', 'utf-8');

// 1. Customer
content = content.replace(
  /'Customer \/ General'/g,
  "'Customer'"
);

// 2. Invoice # -> Invoice -
content = content.replace(
  />Invoice #<\/span>/g,
  ">Invoice -</span>"
);

// 3. Address wrap and align
content = content.replace(
  /className="flex items-center gap-2.5"><MapPin className="w-3.5 h-3.5"\/><span className="font-medium max-w-\[200px\] truncate">/g,
  'className="flex items-start gap-2.5"><MapPin className="w-3.5 h-3.5 mt-0.5"/> <span className="font-medium max-w-[200px] whitespace-normal">'
);
content = content.replace(
  /<MapPin className="w-3.5 h-3.5"\/> <span className="font-medium max-w-\[200px\] truncate">/g,
  '<MapPin className="w-3.5 h-3.5 mt-0.5"/> <span className="font-medium max-w-[180px] whitespace-normal">'
);


// 4. Fix totals
// Subtotal
content = content.replace(
  /<div className="w-1\/2 py-2 px-3 text-right font-medium text-\[#333B4F\] flex items-center justify-end">\{\(sale.subtotal/g,
  '<div className={`w-1/2 ${printSize === \'A6\' ? \'py-1 px-1.5\' : \'py-2 px-3\'} text-right font-medium text-[#333B4F] flex items-center justify-end`}>{(sale.subtotal'
);

// Discount
content = content.replace(
  /<div className="w-1\/2 bg-\[#333B4F\] text-white py-2 px-3 font-semibold flex items-center border-b border-\[#4A6568\]">Discount<\/div>/g,
  '<div className={`w-1/2 bg-[#333B4F] text-white ${printSize === \'A6\' ? \'py-1 px-1.5\' : \'py-2 px-3\'} font-semibold flex items-center border-b border-[#4A6568]`}>Discount</div>'
);
content = content.replace(
  /<div className="w-1\/2 py-2 px-3 text-right font-medium text-\[#333B4F\] flex items-center justify-end">\{\(sale.discount/g,
  '<div className={`w-1/2 ${printSize === \'A6\' ? \'py-1 px-1.5\' : \'py-2 px-3\'} text-right font-medium text-[#333B4F] flex items-center justify-end`}>{(sale.discount'
);

// TOTAL
content = content.replace(
  /<div className="w-1\/2 bg-\[#333B4F\] text-white py-3 px-3 font-bold text-lg flex items-center tracking-wider">TOTAL<\/div>/g,
  '<div className={`w-1/2 bg-[#333B4F] text-white ${printSize === \'A6\' ? \'py-1 px-1.5 text-base\' : \'py-3 px-3 text-lg\'} font-bold flex items-center tracking-wider`}>TOTAL</div>'
);
content = content.replace(
  /<div className="w-1\/2 py-3 px-3 text-right font-bold text-lg text-\[#333B4F\] flex items-center justify-end">\{\(sale.grandTotal/g,
  '<div className={`w-1/2 ${printSize === \'A6\' ? \'py-1 px-1.5 text-base\' : \'py-3 px-3 text-lg\'} text-right font-bold text-[#333B4F] flex items-center justify-end`}>{(sale.grandTotal'
);

fs.writeFileSync('src/components/VoucherModal.tsx', content);
