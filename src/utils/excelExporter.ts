import ExcelJS from 'exceljs';
import { Product, StockInRecord, SaleRecord, ShopInfo } from '../types';

export async function exportPOSToExcel(
  products: Product[],
  stockInList: StockInRecord[],
  salesList: SaleRecord[],
  shopInfo: ShopInfo,
  filename: string = 'POS_Sales_Report.xlsx'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = shopInfo.name || 'အအေးခဲ အသားငါး အရောင်းဆိုင် (တောင်ကြီးမြို့) စားသောက်ဆိုင်';
  workbook.created = new Date();

  // Create a single sheet: "အရောင်း အစီရင်ခံစာ"
  const sheet = workbook.addWorksheet('အရောင်း အစီရင်ခံစာ', {
    views: [{ showGridLines: true }],
  });

  // Set Column Widths
  sheet.columns = [
    { key: 'voucherNo', width: 18 },    // Col A
    { key: 'date', width: 15 },         // Col B
    { key: 'time', width: 12 },         // Col C
    { key: 'customer', width: 22 },     // Col D
    { key: 'saleType', width: 16 },     // Col E
    { key: 'totalQty', width: 20 },     // Col F
    { key: 'grandTotal', width: 22 },   // Col G
    { key: 'paymentMethod', width: 16 },// Col H
    { key: 'notes', width: 25 },        // Col I
  ];

  // Styling Definitions
  const titleFont: Partial<ExcelJS.Font> = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  const headerFont: Partial<ExcelJS.Font> = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  const cardHeaderFont: Partial<ExcelJS.Font> = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '334155' } };
  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'CBD5E1' } },
    left: { style: 'thin', color: { argb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
    right: { style: 'thin', color: { argb: 'CBD5E1' } },
  };

  // Row 1-2: Main Shop Title Banner
  sheet.mergeCells('A1:I2');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `${shopInfo.name || 'အအေးခဲ အသားငါး အရောင်းဆိုင် (တောင်ကြီးမြို့) စားသောက်ဆိုင်'} - အရောင်း အစီရင်ခံစာ`;
  titleCell.font = titleFont;
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 3: Subtitle / Date Generated
  sheet.mergeCells('A3:I3');
  const subTitleCell = sheet.getCell('A3');
  const todayStr = new Date().toISOString().split('T')[0];
  subTitleCell.value = `ထုတ်ယူသည့် ရက်စွဲ: ${todayStr} | ဖုန်း: ${shopInfo.phone || '-'} | လိပ်စာ: ${shopInfo.address || '-'}`;
  subTitleCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '475569' } };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 5: Date Reference Cell with Data Validation for Formulas
  sheet.getCell('A5').value = 'စစ်ဆေးမည့် ရက်စွဲ:';
  sheet.getCell('A5').font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '1E293B' } };

  const dateRefCell = sheet.getCell('B5');
  dateRefCell.value = 'All'; // Default to All
  dateRefCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '1D4ED8' } };
  dateRefCell.alignment = { horizontal: 'center' };
  dateRefCell.border = borderStyle;
  dateRefCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EFF6FF' } };

  // Generate unique sorted list of dates from salesList for Excel Data Validation
  const uniqueDates = Array.from(
    new Set(['All', todayStr, ...salesList.map((s) => s.date).filter(Boolean)])
  ).sort().reverse();
  
  dateRefCell.dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: [`"${uniqueDates.slice(0, 50).join(',')}"`],
    showErrorMessage: true,
    errorTitle: 'ရက်စွဲ ရွေးချယ်ရန်',
    error: 'ကျေးဇူးပြု၍ စာရင်းရှိ ရက်စွဲတစ်ခုကို ရွေးချယ်ပါ။',
  };

  // Helper cell for formulas when B5 is "All"
  sheet.getCell('K5').value = { formula: '=IF(B5="All", "' + todayStr + '", B5)' };
  sheet.getCell('K5').font = { color: { argb: 'FFFFFF' } };

  const lastDataRow = Math.max(15, 14 + salesList.length);
  // Row 7-9: Formula Summary Cards (Today / This Week / This Month / This Year / All Time)
  const summaryCards = [
    { title: 'ရွေးချယ်ထားသော ရက်စွဲ (Daily)', cellRange: 'A7:D8', valCell: 'A8', labelCell: 'A7', color: 'DBEAFE', formula: `=SUMIF(B15:B${lastDataRow}, K5, G15:G${lastDataRow})` },
    { title: 'စုစုပေါင်း (Total)', cellRange: 'E7:I8', valCell: 'E8', labelCell: 'E7', color: 'E0E7FF', formula: `=SUM(G15:G${lastDataRow})` },
  ];

  summaryCards.forEach((card) => {
    const lCell = sheet.getCell(card.labelCell);
    lCell.value = card.title;
    lCell.font = cardHeaderFont;
    lCell.alignment = { horizontal: 'center', vertical: 'middle' };
    lCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: card.color } };

    const vCell = sheet.getCell(card.valCell);
    vCell.value = { formula: card.formula };
    vCell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: '0F172A' } };
    vCell.numFmt = '#,##0 "ကျပ်"';
    vCell.alignment = { horizontal: 'center', vertical: 'middle' };
    vCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: card.color } };
  });

  // Merge Card Cells nicely
  sheet.mergeCells('A7:D7');
  sheet.mergeCells('A8:D8');
  sheet.mergeCells('E7:I7');
  sheet.mergeCells('E8:I8');

  // Row 10-12: Empty Spacer & Section Header
  sheet.getCell('A11').value = '📊 အရောင်း အသေးစိတ် မှတ်တမ်းများ (Detailed Sales Records)';
  sheet.getCell('A11').font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: '1E3A8A' } };

  // Row 14: Data Table Headers
  const tableHeaders = [
    'ဘောင်ချာအမှတ်',
    'ရက်စွဲ',
    'အချိန်',
    'ဝယ်သူအမည်',
    'အမျိုးအစား',
    'စုစုပေါင်း အရေအတွက်',
    'ကျသင့်ငွေ (ကျပ်)',
    'ငွေရှင်းပုံစံ',
    'မှတ်ချက်',
  ];
  const headerRow = sheet.getRow(14);
  headerRow.height = 26;
  tableHeaders.forEach((hdr, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.value = hdr;
    cell.font = headerFont;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderStyle;
  });

  // Populate Sales Data Statically like before
  let currentRowIndex = 15;
  salesList.forEach((sale, idx) => {
    const row = sheet.getRow(currentRowIndex);
    row.height = 20;
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? 'FFFFFF' : 'F8FAFC';

    // Total Qty across sale items
    const totalQty = sale.totalQty ?? sale.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
    const isRefunded = sale.status === 'Refunded';

    row.getCell(1).value = sale.voucherNo;
    row.getCell(2).value = sale.date; // YYYY-MM-DD
    row.getCell(3).value = sale.time;
    row.getCell(4).value = sale.customerName || 'အမည်မရှိဝယ်သူ';
    row.getCell(5).value = sale.saleType === 'Retail' ? 'လက်လီ' : 'လက်ကား';
    row.getCell(6).value = isRefunded ? 0 : totalQty;
    row.getCell(7).value = isRefunded ? 0 : sale.grandTotal;
    row.getCell(8).value = isRefunded ? 'Refunded' : sale.paymentMethod;
    row.getCell(9).value = isRefunded ? `[Refunded] ${sale.refundReason || ''}` : sale.notes || '';

    // Formats & Alignments
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    
    row.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(6).numFmt = '#,##0';
    row.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(7).numFmt = '#,##0 "ကျပ်"';
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(9).alignment = { horizontal: 'left', vertical: 'middle' };

    for (let c = 1; c <= 9; c++) {
      const cell = row.getCell(c);
      cell.font = {
        name: 'Segoe UI',
        size: 10,
        strike: isRefunded,
        color: isRefunded ? { argb: '94A3B8' } : { argb: '0F172A' },
      };
      cell.border = borderStyle;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isRefunded ? 'FEE2E2' : rowBg },
      };
    }
    currentRowIndex++;
  });

  // Add AutoFilter to the Table Headers (like Ctrl+T)
  sheet.autoFilter = `A14:I${Math.max(14, currentRowIndex - 1)}`;

  // Total Summary Row at the bottom
  const totalRow = sheet.getRow(currentRowIndex);
  totalRow.height = 24;
  totalRow.getCell(1).value = 'စုစုပေါင်း (Total)';
  totalRow.getCell(1).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '1E3A8A' } };
  totalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  
  totalRow.getCell(6).value = { formula: `=SUBTOTAL(109, F15:F${currentRowIndex - 1})` };
  totalRow.getCell(6).font = { name: 'Segoe UI', size: 11, bold: true };
  totalRow.getCell(6).numFmt = '#,##0';
  totalRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };

  totalRow.getCell(7).value = { formula: `=SUBTOTAL(109, G15:G${currentRowIndex - 1})` };
  totalRow.getCell(7).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '1E3A8A' } };
  totalRow.getCell(7).numFmt = '#,##0 "ကျပ်"';
  totalRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };

  for (let c = 1; c <= 9; c++) {
    const cell = totalRow.getCell(c);
    cell.border = {
      top: { style: 'medium', color: { argb: '1E3A8A' } },
      bottom: { style: 'double', color: { argb: '1E3A8A' } },
      left: { style: 'thin', color: { argb: 'CBD5E1' } },
      right: { style: 'thin', color: { argb: 'CBD5E1' } },
    };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEF2FF' } };
  }

  // Generate Excel file buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

export interface WasteExportItem {
  productCode: string;
  productName: string;
  date: string;
  expiryDate: string;
  qty: number;
  unit?: string;
  purchasePrice: number;
  lossAmount: number;
  storageLocation?: string;
  isExpired: boolean;
  isExpiringSoon?: boolean;
}

export async function exportWasteToExcel(
  items: WasteExportItem[],
  shopInfo: ShopInfo,
  filename: string = 'Waste_Expiry_Report.xlsx'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = shopInfo.name || 'အအေးခဲ အသားငါး အရောင်းဆိုင်';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Waste & Expiry စာရင်း', {
    views: [{ showGridLines: true }],
  });

  sheet.columns = [
    { key: 'no', width: 8 },             // Col A - စဉ်
    { key: 'productCode', width: 18 },    // Col B - ကုန်ပစ္စည်းကုဒ်
    { key: 'productName', width: 28 },    // Col C - ကုန်ပစ္စည်းအမည်
    { key: 'date', width: 14 },           // Col D - အဝင်ရက်စွဲ
    { key: 'expiryDate', width: 16 },     // Col E - သက်တမ်းကုန်ရက်
    { key: 'qty', width: 14 },            // Col F - အရေအတွက်
    { key: 'unit', width: 10 },           // Col G - ယူနစ်
    { key: 'purchasePrice', width: 16 },  // Col H - ဝယ်ဈေး (၁ ခု)
    { key: 'lossAmount', width: 20 },     // Col I - ဆုံးရှုံးမှုတန်ဖိုး
    { key: 'storageLocation', width: 18 },// Col J - သိမ်းဆည်းနေရာ
    { key: 'status', width: 18 },         // Col K - အခြေအနေ
  ];

  const titleFont: Partial<ExcelJS.Font> = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  const headerFont: Partial<ExcelJS.Font> = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'CBD5E1' } },
    left: { style: 'thin', color: { argb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
    right: { style: 'thin', color: { argb: 'CBD5E1' } },
  };

  // Row 1-2: Title Banner
  sheet.mergeCells('A1:K2');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `${shopInfo.name || 'အအေးခဲ အသားငါး အရောင်းဆိုင်'} - စွန့်ပစ်/သက်တမ်းလွန် ကုန်ပစ္စည်းများ အစီရင်ခံစာ (Waste Report)`;
  titleCell.font = titleFont;
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '991B1B' } }; // Rose 800
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 3: Subtitle
  sheet.mergeCells('A3:K3');
  const subTitleCell = sheet.getCell('A3');
  const todayStr = new Date().toISOString().split('T')[0];
  subTitleCell.value = `ထုတ်ယူသည့် ရက်စွဲ: ${todayStr} | ဖုန်း: ${shopInfo.phone || '-'} | စုစုပေါင်း သက်တမ်းကုန်ပစ္စည်း: ${items.length} သုတ်`;
  subTitleCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '475569' } };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Summary Row
  const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
  const totalLoss = items.reduce((s, i) => s + (i.lossAmount || 0), 0);

  sheet.mergeCells('A5:C5');
  sheet.getCell('A5').value = `စုစုပေါင်း အသုတ်: ${items.length} သုတ်`;
  sheet.getCell('A5').font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '991B1B' } };

  sheet.mergeCells('D5:F5');
  sheet.getCell('D5').value = `စုစုပေါင်း သက်တမ်းလွန် အရေအတွက်: ${totalQty.toLocaleString()}`;
  sheet.getCell('D5').font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'D97706' } };

  sheet.mergeCells('G5:K5');
  sheet.getCell('G5').value = `စုစုပေါင်း ဆုံးရှုံးမှုတန်ဖိုး: ${totalLoss.toLocaleString()} ကျပ်`;
  sheet.getCell('G5').font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'DC2626' } };

  // Row 7: Headers
  const headerRow = sheet.getRow(7);
  headerRow.height = 26;
  const headers = [
    'စဉ်',
    'ကုန်ပစ္စည်းကုဒ်',
    'ကုန်ပစ္စည်းအမည်',
    'အဝင်ရက်စွဲ',
    'သက်တမ်းကုန်ရက်',
    'အရေအတွက်',
    'ယူနစ်',
    'ဝယ်ဈေး (၁ ခု)',
    'ဆုံးရှုံးမှုတန်ဖိုး',
    'သိမ်းဆည်းနေရာ',
    'အခြေအနေ',
  ];
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: idx === 2 ? 'left' : (idx === 5 || idx === 7 || idx === 8 ? 'right' : 'center') };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
    cell.border = borderStyle;
  });

  let currentRow = 8;
  items.forEach((item, index) => {
    const r = sheet.getRow(currentRow);
    r.height = 20;

    r.getCell(1).value = index + 1;
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(2).value = item.productCode;
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).font = { bold: true };

    r.getCell(3).value = item.productName;
    r.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };

    r.getCell(4).value = item.date;
    r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(5).value = item.expiryDate;
    r.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(5).font = { bold: true, color: { argb: item.isExpired ? 'DC2626' : 'D97706' } };

    r.getCell(6).value = item.qty;
    r.getCell(6).numFmt = '#,##0';
    r.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };

    r.getCell(7).value = item.unit || 'ခု';
    r.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(8).value = item.purchasePrice;
    r.getCell(8).numFmt = '#,##0';
    r.getCell(8).alignment = { horizontal: 'right', vertical: 'middle' };

    r.getCell(9).value = item.lossAmount;
    r.getCell(9).numFmt = '#,##0';
    r.getCell(9).font = { bold: true, color: { argb: 'DC2626' } };
    r.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };

    r.getCell(10).value = item.storageLocation || '-';
    r.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(11).value = item.isExpired ? 'သက်တမ်းကုန် (Waste)' : '၇ ရက်အတွင်း ကုန်မည်';
    r.getCell(11).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(11).font = { bold: true, color: { argb: item.isExpired ? 'DC2626' : 'D97706' } };

    const bg = item.isExpired ? 'FFF1F2' : (index % 2 === 1 ? 'F8FAFC' : 'FFFFFF');
    for (let c = 1; c <= 11; c++) {
      const cell = r.getCell(c);
      cell.border = borderStyle;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    }

    currentRow++;
  });

  // Table AutoFilter
  sheet.autoFilter = `A7:K${Math.max(7, currentRow - 1)}`;

  // Total Summary row
  const totalRow = sheet.getRow(currentRow);
  totalRow.height = 24;
  totalRow.getCell(1).value = 'စုစုပေါင်း (Total)';
  totalRow.getCell(1).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '991B1B' } };
  totalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  totalRow.getCell(6).value = { formula: `=SUBTOTAL(109, F8:F${currentRow - 1})` };
  totalRow.getCell(6).numFmt = '#,##0';
  totalRow.getCell(6).font = { bold: true };
  totalRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };

  totalRow.getCell(9).value = { formula: `=SUBTOTAL(109, I8:I${currentRow - 1})` };
  totalRow.getCell(9).numFmt = '#,##0 "ကျပ်"';
  totalRow.getCell(9).font = { bold: true, color: { argb: 'DC2626' } };
  totalRow.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };

  for (let c = 1; c <= 11; c++) {
    const cell = totalRow.getCell(c);
    cell.border = {
      top: { style: 'medium', color: { argb: '991B1B' } },
      bottom: { style: 'double', color: { argb: '991B1B' } },
      left: { style: 'thin', color: { argb: 'CBD5E1' } },
      right: { style: 'thin', color: { argb: 'CBD5E1' } },
    };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF2F2' } };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
