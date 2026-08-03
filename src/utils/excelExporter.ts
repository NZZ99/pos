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
  const titleFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 14,
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  const cardHeaderFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 10,
    bold: true,
    color: { argb: '334155' },
  };

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
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E3A8A' }, // Navy Blue
  };
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
  dateRefCell.value = todayStr; // Format: YYYY-MM-DD
  dateRefCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '1D4ED8' } };
  dateRefCell.alignment = { horizontal: 'center' };
  dateRefCell.border = borderStyle;
  dateRefCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EFF6FF' } };

  // Generate unique sorted list of dates from salesList for Excel Data Validation
  const uniqueDates = Array.from(
    new Set([todayStr, ...salesList.map((s) => s.date).filter(Boolean)])
  )
    .sort()
    .reverse();

  dateRefCell.dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: [`"${uniqueDates.slice(0, 50).join(',')}"`],
    showErrorMessage: true,
    errorTitle: 'ရက်စွဲ ရွေးချယ်ရန်',
    error: 'ကျေးဇူးပြု၍ စာရင်းရှိ ရက်စွဲတစ်ခုကို ရွေးချယ်ပါ။',
  };

  // Row 7-9: Formula Summary Cards (Today / This Week / This Month / This Year / All Time)
  const summaryCards = [
    { title: 'ဒီနေ့ အရောင်း (Daily)', cellRange: 'A7:B8', valCell: 'A8', labelCell: 'A7', color: 'DBEAFE', formula: '=SUMIF(B15:B5000, B5, G15:G5000)' },
    { title: 'ဒီအပတ် အရောင်း (Weekly)', cellRange: 'C7:D8', valCell: 'C8', labelCell: 'C7', color: 'DCFCE7', formula: '=SUMIFS(G15:G5000, B15:B5000, ">="&(DATEVALUE(B5)-WEEKDAY(DATEVALUE(B5),2)+1), B15:B5000, "<="&(DATEVALUE(B5)-WEEKDAY(DATEVALUE(B5),2)+7))' },
    { title: 'ဒီလ အရောင်း (Monthly)', cellRange: 'E7:F8', valCell: 'E8', labelCell: 'E7', color: 'FEF3C7', formula: '=SUMIFS(G15:G5000, B15:B5000, ">="&DATE(YEAR(DATEVALUE(B5)),MONTH(DATEVALUE(B5)),1), B15:B5000, "<="&EOMONTH(DATEVALUE(B5),0))' },
    { title: 'ဒီနှစ် အရောင်း (Yearly)', cellRange: 'G7:H8', valCell: 'G8', labelCell: 'G7', color: 'F3E8FF', formula: '=SUMIFS(G15:G5000, B15:B5000, ">="&DATE(YEAR(DATEVALUE(B5)),1,1), B15:B5000, "<="&DATE(YEAR(DATEVALUE(B5)),12,31))' },
    { title: 'စုစုပေါင်း အရောင်း (Total)', cellRange: 'I7:I8', valCell: 'I8', labelCell: 'I7', color: 'E0E7FF', formula: '=SUM(G15:G5000)' },
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
  sheet.mergeCells('A7:B7');
  sheet.mergeCells('A8:B8');
  sheet.mergeCells('C7:D7');
  sheet.mergeCells('C8:D8');
  sheet.mergeCells('E7:F7');
  sheet.mergeCells('E8:F8');
  sheet.mergeCells('G7:H7');
  sheet.mergeCells('G8:H8');

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

  // Populate Sales Data
  let currentRowIndex = 15;
  salesList.forEach((sale, idx) => {
    const row = sheet.getRow(currentRowIndex);
    row.height = 20;

    const isEven = idx % 2 === 0;
    const rowBg = isEven ? 'FFFFFF' : 'F8FAFC';

    // Total Qty across sale items
    const totalQty = sale.totalQty ?? sale.items.reduce((acc, it) => acc + (it.quantity || 1), 0);

    row.getCell(1).value = sale.voucherNo;
    row.getCell(2).value = sale.date; // YYYY-MM-DD
    row.getCell(3).value = sale.time;
    row.getCell(4).value = sale.customerName || 'အမည်မရှိဝယ်သူ';
    row.getCell(5).value = sale.saleType === 'Retail' ? 'လက်လီ' : 'လက်ကား';
    row.getCell(6).value = totalQty;
    row.getCell(7).value = sale.grandTotal;
    row.getCell(8).value = sale.paymentMethod;
    row.getCell(9).value = sale.notes || '';

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
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.border = borderStyle;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
    }

    currentRowIndex++;
  });

  // Total Summary Row at the bottom
  const totalRow = sheet.getRow(currentRowIndex);
  totalRow.height = 24;

  totalRow.getCell(1).value = 'စုစုပေါင်း (Total)';
  totalRow.getCell(1).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '1E3A8A' } };
  totalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  totalRow.getCell(6).value = { formula: `=SUM(F15:F${currentRowIndex - 1})` };
  totalRow.getCell(6).font = { name: 'Segoe UI', size: 11, bold: true };
  totalRow.getCell(6).numFmt = '#,##0';
  totalRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };

  totalRow.getCell(7).value = { formula: `=SUM(G15:G${currentRowIndex - 1})` };
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
