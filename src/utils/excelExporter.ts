import ExcelJS from 'exceljs';
import { Product, StockInRecord, SaleRecord, ShopInfo } from '../types';

export async function exportPOSToExcel(
  products: Product[],
  stockInList: StockInRecord[],
  salesList: SaleRecord[],
  shopInfo: ShopInfo,
  filename: string = 'Cold_Storage_POS_System.xlsx'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = shopInfo.name || 'Frozen Meat POS System';
  workbook.created = new Date();

  // Color theme definitions (Soft Indigo / Navy)
  const PRIMARY_HEADER_COLOR = '1E293B'; // Dark Slate / Navy
  const SECONDARY_HEADER_COLOR = '3730A3'; // Indigo Header
  const LIGHT_BLUE_FILL = 'F1F5F9'; // Light Slate Zebra Fill
  const TOTAL_ROW_COLOR = 'E0E7FF'; // Soft Indigo Highlight for Totals

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  const titleFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 14,
    bold: true,
    color: { argb: '3730A3' },
  };

  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'CBD5E1' } },
    left: { style: 'thin', color: { argb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
    right: { style: 'thin', color: { argb: 'CBD5E1' } },
  };

  // -------------------------------------------------------------
  // Helper: Add Navigation Bar at the top of a worksheet
  // -------------------------------------------------------------
  const addNavBar = (sheet: ExcelJS.Worksheet, activeSheetIndex: number) => {
    const navRow = sheet.getRow(1);
    navRow.height = 24;

    const navItems = [
      { text: '🏠 0. Dashboard', sheetName: '၀။ Dashboard' },
      { text: '📦 1. ပစ္စည်းမော်ဒယ်', sheetName: '၁။ ပစ္စည်းမော်ဒယ်ဇယား' },
      { text: '📥 2. ပစ္စည်းအဝင်', sheetName: '၂။ ပစ္စည်းအဝင်စာရင်း' },
      { text: '🛒 3. အရောင်းမှတ်တမ်း', sheetName: '၃။ အရောင်းမှတ်တမ်း' },
      { text: '🧊 4. လက်ရှိစတော့', sheetName: '၄။ လက်ရှိစတော့ကျန်' },
      { text: '🧾 5. ဘောင်ချာရိုက်ရန်', sheetName: '၅။ ဘောင်ချာ ရိုက်ထုတ်ရန်' },
      { text: '📊 6. အရောင်းသုံးသပ်ချက်', sheetName: '၆။ အရောင်း သုံးသပ်ချက်' },
    ];

    const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    navItems.forEach((item, idx) => {
      const cell = sheet.getCell(`${colLetters[idx]}1`);
      cell.value = { text: item.text, hyperlink: `#'${item.sheetName}'!A1` };
      cell.font = {
        name: 'Segoe UI',
        size: 9,
        bold: true,
        color: { argb: idx === activeSheetIndex ? 'FFFFFF' : '3730A3' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: idx === activeSheetIndex ? '3730A3' : 'EEF2FF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = borderStyle;
    });
  };

  // Helper: Apply explicit clean white background & view options to sheet
  const applyCleanBackground = (sheet: ExcelJS.Worksheet, maxRows: number = 40, maxCols: number = 10) => {
    sheet.views = [
      {
        state: 'frozen',
        ySplit: 1,
        showGridLines: false,
        showRowColHeaders: false,
      },
    ];

    for (let r = 1; r <= maxRows; r++) {
      for (let c = 1; c <= maxCols; c++) {
        const cell = sheet.getCell(r, c);
        if (!cell.fill) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' },
          };
        }
      }
    }
  };

  // -------------------------------------------------------------
  // Sheet 0: Main Dashboard & Quick Action Links (၀။ Dashboard)
  // -------------------------------------------------------------
  const sheet0 = workbook.addWorksheet('၀။ Dashboard');

  addNavBar(sheet0, 0);

  sheet0.mergeCells('A3:G3');
  const dashTitle = sheet0.getCell('A3');
  dashTitle.value = `🏪 ${shopInfo.name} - Excel POS Control Dashboard`;
  dashTitle.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: '1E293B' } };
  dashTitle.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet0.getRow(3).height = 32;

  sheet0.mergeCells('A4:G4');
  const dashSub = sheet0.getCell('A4');
  dashSub.value = `${shopInfo.tagline} | ဖုန်း: ${shopInfo.phone} | လိပ်စာ: ${shopInfo.address}`;
  dashSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '64748B' } };

  // Summary Cards Row
  sheet0.mergeCells('A6:B7');
  const c1 = sheet0.getCell('A6');
  c1.value = `📦 စုစုပေါင်း ပစ္စည်း\n${products.length} မျိုး`;
  c1.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: '1E293B' } };
  c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E7FF' } };
  c1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  c1.border = borderStyle;

  sheet0.mergeCells('C6:D7');
  const c2 = sheet0.getCell('C6');
  c2.value = `📥 စုစုပေါင်း အဝင် KG\n${stockInList.reduce((s, x) => s + x.totalKg, 0).toLocaleString()} KG`;
  c2.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: '065F46' } };
  c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
  c2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  c2.border = borderStyle;

  sheet0.mergeCells('E6:G7');
  const c3 = sheet0.getCell('E6');
  c3.value = `🛒 စုစုပေါင်း အရောင်းရငွေ\n${salesList.reduce((s, x) => s + x.grandTotal, 0).toLocaleString()} ကျပ်`;
  c3.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: '1E3A8A' } };
  c3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } };
  c3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  c3.border = borderStyle;

  // Quick Action Links Table
  sheet0.mergeCells('A9:G9');
  const qTitle = sheet0.getCell('A9');
  qTitle.value = '⚡ Excel POS အသုံးပြုရန် Quick Navigation ခလုတ်များ';
  qTitle.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  qTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3730A3' } };
  qTitle.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet0.getRow(9).height = 24;

  const quickLinks = [
    { name: '📦 ၁။ ပစ္စည်းမော်ဒယ်ဇယား (Products Master)', desc: 'ကုန်ပစ္စည်းအမည်၊ ဈေးနှုန်းနှင့် min stock သတ်မှတ်ရန်', sheet: '၁။ ပစ္စည်းမော်ဒယ်ဇယား' },
    { name: '📥 ၂။ ပစ္စည်းအဝင်စာရင်း (Stock-In Log)', desc: 'အဝင်အသစ်များ၊ Batch ID နှင့် ဝယ်ဈေးထည့်သွင်းရန် (Formulas Auto Calculated)', sheet: '၂။ ပစ္စည်းအဝင်စာရင်း' },
    { name: '🛒 ၃။ အရောင်းမှတ်တမ်း (Sales POS Log)', desc: 'လက်လီ/လက်ကား အရောင်းများနှင့် ဘောင်ချာမှတ်တမ်းများ', sheet: '၃။ အရောင်းမှတ်တမ်း' },
    { name: '🧊 ၄။ လက်ရှိစတော့ကျန် (Realtime Inventory)', desc: 'အဝင် minus အရောင်း စတော့ကျန်နှင့် သတိပေးချက်များ (Auto Excel SUMIF)', sheet: '၄။ လက်ရှိစတော့ကျန်' },
    { name: '🧾 ၅။ ဘောင်ချာ ရိုက်ထုတ်ရန် (Voucher Print)', desc: 'ဝယ်သူအတွက် Excel မှ တိုက်ရိုက် Print ထုတ်ယူနိုင်သော ဘောင်ချာ ပုံစံ', sheet: '၅။ ဘောင်ချာ ရိုက်ထုတ်ရန်' },
    { name: '📊 ၆။ အရောင်း သုံးသပ်ချက် (Sales Summary)', desc: 'လက်လီ/လက်ကား နှင့် ငွေရှင်းပုံစံအလိုက် စုစုပေါင်းဇယား', sheet: '၆။ အရောင်း သုံးသပ်ချက်' },
  ];

  quickLinks.forEach((item, idx) => {
    const r = 10 + idx;
    sheet0.mergeCells(`A${r}:C${r}`);
    sheet0.mergeCells(`D${r}:G${r}`);

    const cellBtn = sheet0.getCell(`A${r}`);
    cellBtn.value = { text: item.name, hyperlink: `#'${item.sheet}'!A1` };
    cellBtn.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '3730A3' } };
    cellBtn.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
    cellBtn.border = borderStyle;

    const cellDesc = sheet0.getCell(`D${r}`);
    cellDesc.value = item.desc;
    cellDesc.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: '475569' } };
    cellDesc.border = borderStyle;

    sheet0.getRow(r).height = 22;
  });

  // VBA Code Block for Full-App view mode in Excel
  sheet0.mergeCells('A18:G18');
  const vbaTitle = sheet0.getCell('A18');
  vbaTitle.value = '💻 Excel ကို Software အဖြစ် အပြည့်အဝ ပြောင်းလဲရန် VBA Macro Code (အသုံးပြုနည်း)';
  vbaTitle.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  vbaTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E1B4B' } };
  vbaTitle.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet0.getRow(18).height = 24;

  const vbaRows = [
    'လမ်းညွှန်: Excel ဖိုင်ဖွင့်ပြီး Alt + F11 ကိုနှိပ်ပါ -> ThisWorkbook ကို Double Click နှိပ်ပါ -> အောက်ပါ Code ကို Paste လုပ်ပြီး .xlsm မက်ခရိုဖိုင်အဖြစ် Save ပါ။',
    'Private Sub Workbook_Open()',
    '    On Error Resume Next',
    '    Application.DisplayFormulaBar = False',
    '    Dim ws As Worksheet',
    '    For Each ws In ThisWorkbook.Worksheets',
    '        ws.Activate',
    '        ActiveWindow.DisplayGridLines = False',
    '        ActiveWindow.DisplayHeadings = False',
    '    Next ws',
    '    Sheets("၀။ Dashboard").Activate',
    'End Sub',
  ];

  vbaRows.forEach((txt, idx) => {
    const r = 19 + idx;
    sheet0.mergeCells(`A${r}:G${r}`);
    const cell = sheet0.getCell(`A${r}`);
    cell.value = txt;
    cell.font = {
      name: idx === 0 ? 'Segoe UI' : 'Consolas',
      size: idx === 0 ? 9 : 9.5,
      bold: idx === 0,
      color: { argb: idx === 0 ? 'B45309' : '065F46' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: idx === 0 ? 'FEF3C7' : 'F0FDF4' },
    };
    cell.border = borderStyle;
    sheet0.getRow(r).height = 20;
  });

  sheet0.columns = [
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 24 },
  ];

  applyCleanBackground(sheet0, 35, 8);


  // -------------------------------------------------------------
  // Sheet 1: Products Master Database (၁။ ပစ္စည်းမော်ဒယ်ဇယား)
  // -------------------------------------------------------------
  const sheet1 = workbook.addWorksheet('၁။ ပစ္စည်းမော်ဒယ်ဇယား');
  sheet1.views = [{ state: 'frozen', ySplit: 1, showGridLines: false, showRowColHeaders: false }];

  addNavBar(sheet1, 1);

  sheet1.mergeCells('A3:F3');
  const title1 = sheet1.getCell('A3');
  title1.value = `${shopInfo.name} - ကုန်ပစ္စည်း မော်ဒယ်/မာစတာ ဇယား (Products Master)`;
  title1.font = titleFont;
  title1.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet1.getRow(3).height = 30;

  const pHeaders = [
    'ကုန်ပစ္စည်းကုဒ်',
    'ကုန်ပစ္စည်းအမည်',
    'လက်လီဈေး (၁-KG)',
    'လက်ကားဈေး (၁-KG)',
    'အနည်းဆုံးလက်ကျန် (KG)',
    'အမျိုးအစား',
  ];
  const pHeaderRow = sheet1.addRow(pHeaders);
  pHeaderRow.height = 25;

  pHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: SECONDARY_HEADER_COLOR },
    };
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderStyle;
  });

  products.forEach((p, index) => {
    const row = sheet1.addRow([
      p.code,
      p.name,
      p.retailPrice,
      p.wholesalePrice,
      p.minStockKg,
      p.category,
    ]);
    row.height = 20;

    row.eachCell((cell, colIndex) => {
      cell.border = borderStyle;
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colIndex >= 3 && colIndex <= 5 ? 'right' : colIndex === 1 || colIndex === 6 ? 'center' : 'left',
      };
      if (colIndex >= 3 && colIndex <= 5) {
        cell.numFmt = '#,##0';
      }
      if (index % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: LIGHT_BLUE_FILL },
        };
      }
    });
  });

  sheet1.columns = [
    { width: 18 },
    { width: 32 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 20 },
  ];

  applyCleanBackground(sheet1, Math.max(35, products.length + 10), 8);

  // Sheet 2: Stock-In Entry Sheet (၂။ ပစ္စည်းအဝင်စာရင်း) with Dynamic Formulas
  // -------------------------------------------------------------
  const sheet2 = workbook.addWorksheet('၂။ ပစ္စည်းအဝင်စာရင်း');

  addNavBar(sheet2, 2);


  sheet2.mergeCells('A3:J3');
  const title2 = sheet2.getCell('A3');
  title2.value = `ပစ္စည်းအဝင်စာရင်း ဇယား (Stock-In Entry Sheet)`;
  title2.font = titleFont;
  title2.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet2.getRow(3).height = 30;

  sheet2.addRow([]);

  const stkHeaders = [
    'ရက်စွဲ',
    'Batch ID',
    'ပစ္စည်းကုဒ်',
    'ပစ္စည်းအမည်',
    'သေတ္တာ (Box)',
    'စုစုပေါင်း KG',
    'ဝယ်ဈေး (၁-KG)',
    'စုစုပေါင်းကျသင့်ငွေ',
    'Expiry Date',
    'သိမ်းဆည်းနေရာ',
  ];

  const stkHeaderRow = sheet2.addRow(stkHeaders);
  stkHeaderRow.height = 25;
  stkHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: SECONDARY_HEADER_COLOR },
    };
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderStyle;
  });

  const stkStartRow = 6;
  stockInList.forEach((stk, index) => {
    const rowNum = stkStartRow + index;
    const row = sheet2.addRow([
      stk.date,
      stk.batchId,
      stk.productCode,
      stk.productName,
      stk.boxCount,
      stk.totalKg,
      stk.purchasePricePerKg,
      // Dynamic Excel Formula: Total Cost = KG * PricePerKg
      { formula: `F${rowNum}*G${rowNum}`, result: stk.totalCost },
      stk.expiryDate,
      stk.storageLocation,
    ]);
    row.height = 20;

    row.eachCell((cell, colIndex) => {
      cell.border = borderStyle;
      cell.font = { name: 'Segoe UI', size: 10 };

      if (colIndex === 5 || colIndex === 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '#,##0.00';
      } else if (colIndex === 7 || colIndex === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '#,##0';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      if (index % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: LIGHT_BLUE_FILL },
        };
      }
    });
  });

  const stkEndRow = stkStartRow + Math.max(stockInList.length - 1, 0);

  // Total Row for Stock In with Excel SUM Formulas
  const stkTotalRow = sheet2.addRow([
    'Total (စုစုပေါင်း)',
    '',
    '',
    '',
    { formula: `SUM(E${stkStartRow}:E${stkEndRow})`, result: stockInList.reduce((s, x) => s + x.boxCount, 0) },
    { formula: `SUM(F${stkStartRow}:F${stkEndRow})`, result: stockInList.reduce((s, x) => s + x.totalKg, 0) },
    '-',
    { formula: `SUM(H${stkStartRow}:H${stkEndRow})`, result: stockInList.reduce((s, x) => s + x.totalCost, 0) },
    '-',
    '-',
  ]);
  stkTotalRow.height = 22;
  stkTotalRow.eachCell((cell, colIndex) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: TOTAL_ROW_COLOR },
    };
    cell.font = { name: 'Segoe UI', size: 10, bold: true };
    cell.border = borderStyle;

    if (colIndex === 5 || colIndex === 6) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = '#,##0.00';
    } else if (colIndex === 8) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = '#,##0';
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  sheet2.columns = [
    { width: 14 },
    { width: 16 },
    { width: 14 },
    { width: 28 },
    { width: 14 },
    { width: 16 },
    { width: 18 },
    { width: 22 },
    { width: 14 },
    { width: 18 },
  ];

  applyCleanBackground(sheet2, Math.max(35, stockInList.length + 10), 12);

  // -------------------------------------------------------------
  // Sheet 3: Sales / POS Entry Sheet (၃။ အရောင်းမှတ်တမ်း) with Dynamic Formulas
  // -------------------------------------------------------------
  const sheet3 = workbook.addWorksheet('၃။ အရောင်းမှတ်တမ်း');

  addNavBar(sheet3, 3);


  sheet3.mergeCells('A3:J3');
  const title3 = sheet3.getCell('A3');
  title3.value = `အရောင်းမှတ်တမ်း ဇယား (Sales / POS Log Sheet)`;
  title3.font = titleFont;
  title3.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet3.getRow(3).height = 30;

  sheet3.addRow([]);

  const salesHeaders = [
    'ဘောင်ချာနံပါတ်',
    'ရက်စွဲ',
    'ဝယ်သူအမည်',
    'အမျိုးအစား',
    'ပစ္စည်းအမည်',
    'Batch ID',
    'အလေးချိန် (KG)',
    'ရောင်းဈေး (KG)',
    'အသားတင်ကျသင့်ငွေ',
    'ငွေရှင်းပုံစံ',
  ];

  const salesHeaderRow = sheet3.addRow(salesHeaders);
  salesHeaderRow.height = 25;
  salesHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: SECONDARY_HEADER_COLOR },
    };
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderStyle;
  });

  const salesStartRow = 6;
  let flatSalesCount = 0;

  salesList.forEach((s) => {
    s.items.forEach((item) => {
      flatSalesCount++;
      const rowNum = salesStartRow + flatSalesCount - 1;

      const row = sheet3.addRow([
        s.voucherNo,
        s.date,
        s.customerName,
        item.saleType || s.saleType === 'Wholesale' ? 'လက်ကား' : 'လက်လီ',
        item.productName,
        item.batchId || '-',
        item.weightKg,
        item.pricePerKg,
        // Dynamic Excel Formula: Amount = Weight * Price
        { formula: `G${rowNum}*H${rowNum}`, result: item.totalAmount },
        s.paymentMethod,
      ]);
      row.height = 20;

      row.eachCell((cell, colIndex) => {
        cell.border = borderStyle;
        cell.font = { name: 'Segoe UI', size: 10 };

        if (colIndex === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0.00';
        } else if (colIndex === 8 || colIndex === 9) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0';
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        if (flatSalesCount % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: LIGHT_BLUE_FILL },
          };
        }
      });
    });
  });

  const salesEndRow = salesStartRow + Math.max(flatSalesCount - 1, 0);

  // Sales Total Row
  const salesTotalRow = sheet3.addRow([
    'Total (စုစုပေါင်း)',
    '',
    '',
    '',
    '',
    '',
    { formula: `SUM(G${salesStartRow}:G${salesEndRow})`, result: salesList.reduce((sum, s) => sum + s.totalWeightKg, 0) },
    '-',
    { formula: `SUM(I${salesStartRow}:I${salesEndRow})`, result: salesList.reduce((sum, s) => sum + s.grandTotal, 0) },
    '-',
  ]);
  salesTotalRow.height = 22;
  salesTotalRow.eachCell((cell, colIndex) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: TOTAL_ROW_COLOR },
    };
    cell.font = { name: 'Segoe UI', size: 10, bold: true };
    cell.border = borderStyle;

    if (colIndex === 7) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = '#,##0.00';
    } else if (colIndex === 9) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = '#,##0';
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  sheet3.columns = [
    { width: 16 },
    { width: 14 },
    { width: 22 },
    { width: 14 },
    { width: 28 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 22 },
    { width: 16 },
  ];

  applyCleanBackground(sheet3, Math.max(35, salesList.length + 10), 12);

  // -------------------------------------------------------------
  // Sheet 4: Current Inventory Stock (၄။ လက်ရှိစတော့ကျန်) with Dynamic SUMIF Formulas
  // -------------------------------------------------------------
  const sheet4 = workbook.addWorksheet('၄။ လက်ရှိစတော့ကျန်');

  addNavBar(sheet4, 4);


  sheet4.mergeCells('A3:G3');
  const title4 = sheet4.getCell('A3');
  title4.value = `လက်ရှိ အအေးခဲစတော့ ကျန်စာရင်း (Current Stock Inventory)`;
  title4.font = titleFont;
  title4.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet4.getRow(3).height = 30;

  sheet4.addRow([]);

  const invHeaders = [
    'ကုန်ပစ္စည်းကုဒ်',
    'ကုန်ပစ္စည်းအမည်',
    'အဝင် စုစုပေါင်း (KG)',
    'အရောင်း စုစုပေါင်း (KG)',
    'လက်ရှိစတော့ (KG)',
    'အနည်းဆုံးသတိပေးချက် (KG)',
    'စတော့အခြေအနေ',
  ];

  const invHeaderRow = sheet4.addRow(invHeaders);
  invHeaderRow.height = 25;
  invHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: SECONDARY_HEADER_COLOR },
    };
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderStyle;
  });

  const invStartRow = 6;

  products.forEach((p, index) => {
    const rowNum = invStartRow + index;

    const totalInVal = stockInList
      .filter((s) => s.productCode === p.code)
      .reduce((sum, s) => sum + s.totalKg, 0);

    const totalSoldVal = salesList.reduce((sum, sale) => {
      const itemKg = sale.items
        .filter((i) => i.productCode === p.code)
        .reduce((sSum, item) => sSum + item.weightKg, 0);
      return sum + itemKg;
    }, 0);

    const currentStockVal = totalInVal - totalSoldVal;
    const isLow = currentStockVal <= p.minStockKg;
    const statusText = isLow ? '⚠️ စတော့နည်းနေသည်' : '✅ ပုံမှန်ရှိသည်';

    // Dynamic Excel Formulas linking StockIn and Sales sheets!
    const row = sheet4.addRow([
      p.code,
      p.name,
      { formula: `SUMIF('၂။ ပစ္စည်းအဝင်စာရင်း'!$C$${stkStartRow}:$C$${stkEndRow}, A${rowNum}, '၂။ ပစ္စည်းအဝင်စာရင်း'!$F$${stkStartRow}:$F$${stkEndRow})`, result: totalInVal },
      { formula: `SUMIF('၃။ အရောင်းမှတ်တမ်း'!$E$${salesStartRow}:$E$${salesEndRow}, B${rowNum}, '၃။ အရောင်းမှတ်တမ်း'!$G$${salesStartRow}:$G$${salesEndRow})`, result: totalSoldVal },
      { formula: `C${rowNum}-D${rowNum}`, result: currentStockVal },
      p.minStockKg,
      { formula: `IF(E${rowNum}<=F${rowNum},"⚠️ စတော့နည်းနေသည်","✅ ပုံမှန်ရှိသည်")`, result: statusText },
    ]);
    row.height = 20;

    row.eachCell((cell, colIndex) => {
      cell.border = borderStyle;
      cell.font = { name: 'Segoe UI', size: 10 };

      if (colIndex >= 3 && colIndex <= 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '#,##0.00';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      if (index % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: LIGHT_BLUE_FILL },
        };
      }
    });
  });

  sheet4.columns = [
    { width: 16 },
    { width: 32 },
    { width: 22 },
    { width: 22 },
    { width: 20 },
    { width: 22 },
    { width: 22 },
  ];

  applyCleanBackground(sheet4, Math.max(35, products.length + 10), 10);

  // -------------------------------------------------------------
  // Sheet 5: Voucher Print Worksheet (၅။ ဘောင်ချာ ရိုက်ထုတ်ရန်)
  // Formatted as a printable invoice layout inside Excel
  // -------------------------------------------------------------
  const sheet5 = workbook.addWorksheet('၅။ ဘောင်ချာ ရိုက်ထုတ်ရန်');

  addNavBar(sheet5, 5);


  sheet5.mergeCells('B3:F3');
  const shopTitle = sheet5.getCell('B3');
  shopTitle.value = shopInfo.name;
  shopTitle.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: '1E293B' } };
  shopTitle.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet5.mergeCells('B4:F4');
  const shopSub = sheet5.getCell('B4');
  shopSub.value = `${shopInfo.tagline} | Phone: ${shopInfo.phone}`;
  shopSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '64748B' } };
  shopSub.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet5.mergeCells('B5:F5');
  const shopAddr = sheet5.getCell('B5');
  shopAddr.value = shopInfo.address;
  shopAddr.font = { name: 'Segoe UI', size: 10, color: { argb: '64748B' } };
  shopAddr.alignment = { horizontal: 'center', vertical: 'middle' };

  // Voucher Info header
  sheet5.getCell('B7').value = 'ဝယ်သူအမည်:';
  sheet5.getCell('C7').value = salesList[0]?.customerName || 'အထွေထွေဝယ်သူ';
  sheet5.getCell('E7').value = 'ဘောင်ချာနံပါတ်:';
  sheet5.getCell('F7').value = salesList[0]?.voucherNo || 'VOU-001';

  sheet5.getCell('B8').value = 'ရက်စွဲ:';
  sheet5.getCell('C8').value = salesList[0]?.date || new Date().toISOString().split('T')[0];
  sheet5.getCell('E8').value = 'ငွေရှင်းပုံစံ:';
  sheet5.getCell('F8').value = salesList[0]?.paymentMethod || 'Cash';

  ['B7', 'E7', 'B8', 'E8'].forEach((c) => {
    sheet5.getCell(c).font = { name: 'Segoe UI', size: 10, bold: true };
  });

  // Voucher Items Table Header
  const vHeaders = ['စဉ်', 'ကုန်ပစ္စည်းအမည်', 'အမျိုးအစား', 'အလေးချိန် (KG)', 'ဈေးနှုန်း (KG)', 'ကျသင့်ငွေ'];
  const vCols = ['A', 'B', 'C', 'D', 'E', 'F'];
  vHeaders.forEach((h, i) => {
    const cell = sheet5.getCell(`${vCols[i]}10`);
    cell.value = h;
    cell.font = headerFont;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3730A3' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = borderStyle;
  });

  const sampleItems = salesList[0]?.items || [
    { productName: 'ကြက်ရင်ပုံသား', saleType: 'Retail', weightKg: 5, pricePerKg: 9000, totalAmount: 45000 },
    { productName: 'ဝက်သုံးထပ်သား', saleType: 'Wholesale', weightKg: 10, pricePerKg: 16000, totalAmount: 160000 },
  ];

  sampleItems.forEach((item, idx) => {
    const r = 11 + idx;
    sheet5.getCell(`A${r}`).value = idx + 1;
    sheet5.getCell(`B${r}`).value = item.productName;
    sheet5.getCell(`C${r}`).value = item.saleType === 'Wholesale' ? 'လက်ကား' : 'လက်လီ';
    sheet5.getCell(`D${r}`).value = item.weightKg;
    sheet5.getCell(`E${r}`).value = item.pricePerKg;
    // Excel formula
    sheet5.getCell(`F${r}`).value = { formula: `D${r}*E${r}`, result: item.totalAmount };

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col, cIdx) => {
      const cell = sheet5.getCell(`${col}${r}`);
      cell.border = borderStyle;
      cell.font = { name: 'Segoe UI', size: 10 };
      if (cIdx >= 3) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0.00';
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // Voucher Summary Box
  const summaryStart = 11 + sampleItems.length + 1;
  sheet5.getCell(`E${summaryStart}`).value = 'စုစုပေါင်း:';
  sheet5.getCell(`F${summaryStart}`).value = { formula: `SUM(F11:F${summaryStart - 1})`, result: salesList[0]?.grandTotal || 205000 };

  sheet5.getCell(`E${summaryStart + 1}`).value = 'လျှော့ဈေး:';
  sheet5.getCell(`F${summaryStart + 1}`).value = 0;

  sheet5.getCell(`E${summaryStart + 2}`).value = 'အသားတင် ကျသင့်ငွေ:';
  sheet5.getCell(`F${summaryStart + 2}`).value = { formula: `F${summaryStart}-F${summaryStart + 1}`, result: salesList[0]?.grandTotal || 205000 };

  ['E', 'F'].forEach((col) => {
    for (let i = summaryStart; i <= summaryStart + 2; i++) {
      const cell = sheet5.getCell(`${col}${i}`);
      cell.font = { name: 'Segoe UI', size: 10, bold: true };
      cell.border = borderStyle;
      if (col === 'F') cell.numFmt = '#,##0 ကျပ်';
    }
  });

  sheet5.columns = [
    { width: 8 },
    { width: 28 },
    { width: 14 },
    { width: 16 },
    { width: 18 },
    { width: 22 },
  ];

  applyCleanBackground(sheet5, 30, 8);

  // -------------------------------------------------------------
  // Sheet 6: Sales Summary Reports (၆။ အရောင်း သုံးသပ်ချက်)
  // Summary dashboard formulas for Daily, Retail/Wholesale, and Payment methods
  // -------------------------------------------------------------
  const sheet6 = workbook.addWorksheet('၆။ အရောင်း သုံးသပ်ချက်');

  addNavBar(sheet6, 6);


  sheet6.mergeCells('A3:E3');
  const title6 = sheet6.getCell('A3');
  title6.value = `အရောင်း သုံးသပ်ချက် အစီရင်ခံစာ (Sales Analytics Summary)`;
  title6.font = titleFont;
  title6.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet6.getRow(3).height = 30;

  sheet6.addRow([]);

  // Summary Metrics Table
  sheet6.mergeCells('A5:D5');
  const sumHeader = sheet6.getCell('A5');
  sumHeader.value = '၁။ အရောင်းအမျိုးအစားအလိုက် စုစုပေါင်း (Sale Type Summary)';
  sumHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  sumHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3730A3' } };

  sheet6.getCell('A6').value = 'အမျိုးအစား';
  sheet6.getCell('B6').value = 'စုစုပေါင်း အလေးချိန် (KG)';
  sheet6.getCell('C6').value = 'စုစုပေါင်း ရောင်းရငွေ (ကျပ်)';
  ['A6', 'B6', 'C6'].forEach((c) => {
    const cell = sheet6.getCell(c);
    cell.font = { name: 'Segoe UI', size: 10, bold: true };
    cell.border = borderStyle;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E7FF' } };
  });

  // Retail Row Formula
  sheet6.getCell('A7').value = 'လက်လီအရောင်း (Retail)';
  sheet6.getCell('B7').value = { formula: `SUMIF('၃။ အရောင်းမှတ်တမ်း'!$D$${salesStartRow}:$D$${salesEndRow}, "လက်လီ", '၃။ အရောင်းမှတ်တမ်း'!$G$${salesStartRow}:$G$${salesEndRow})` };
  sheet6.getCell('C7').value = { formula: `SUMIF('၃။ အရောင်းမှတ်တမ်း'!$D$${salesStartRow}:$D$${salesEndRow}, "လက်လီ", '၃။ အရောင်းမှတ်တမ်း'!$I$${salesStartRow}:$I$${salesEndRow})` };

  // Wholesale Row Formula
  sheet6.getCell('A8').value = 'လက်ကားအရောင်း (Wholesale)';
  sheet6.getCell('B8').value = { formula: `SUMIF('၃။ အရောင်းမှတ်တမ်း'!$D$${salesStartRow}:$D$${salesEndRow}, "လက်ကား", '၃။ အရောင်းမှတ်တမ်း'!$G$${salesStartRow}:$G$${salesEndRow})` };
  sheet6.getCell('C8').value = { formula: `SUMIF('၃။ အရောင်းမှတ်တမ်း'!$D$${salesStartRow}:$D$${salesEndRow}, "လက်ကား", '၃။ အရောင်းမှတ်တမ်း'!$I$${salesStartRow}:$I$${salesEndRow})` };

  // Total Summary
  sheet6.getCell('A9').value = 'စုစုပေါင်း (Grand Total)';
  sheet6.getCell('B9').value = { formula: `SUM(B7:B8)` };
  sheet6.getCell('C9').value = { formula: `SUM(C7:C8)` };

  for (let r = 7; r <= 9; r++) {
    ['A', 'B', 'C'].forEach((col) => {
      const cell = sheet6.getCell(`${col}${r}`);
      cell.border = borderStyle;
      cell.font = { name: 'Segoe UI', size: 10, bold: r === 9 };
      if (col === 'B') cell.numFmt = '#,##0.00 KG';
      if (col === 'C') cell.numFmt = '#,##0 ကျပ်';
    });
  }

  // Payment Method Summary
  sheet6.mergeCells('A12:D12');
  const payHeader = sheet6.getCell('A12');
  payHeader.value = '၂။ ငွေရှင်းပုံစံအလိုက် စုစုပေါင်း (Payment Method Summary)';
  payHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  payHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3730A3' } };

  sheet6.getCell('A13').value = 'ငွေရှင်းပုံစံ';
  sheet6.getCell('B13').value = 'ရောင်းရငွေ (ကျပ်)';

  ['A13', 'B13'].forEach((c) => {
    const cell = sheet6.getCell(c);
    cell.font = { name: 'Segoe UI', size: 10, bold: true };
    cell.border = borderStyle;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E7FF' } };
  });

  const payTypes = [
    { label: 'Cash (ငွေသား)', code: 'Cash' },
    { label: 'KPay / Wave', code: 'KPay' },
    { label: 'Credit (အကြွေး)', code: 'Credit' },
  ];

  payTypes.forEach((pt, pIdx) => {
    const r = 14 + pIdx;
    sheet6.getCell(`A${r}`).value = pt.label;
    sheet6.getCell(`B${r}`).value = { formula: `SUMIF('၃။ အရောင်းမှတ်တမ်း'!$J$${salesStartRow}:$J$${salesEndRow}, "${pt.code}", '၃။ အရောင်းမှတ်တမ်း'!$I$${salesStartRow}:$I$${salesEndRow})` };

    ['A', 'B'].forEach((col) => {
      const cell = sheet6.getCell(`${col}${r}`);
      cell.border = borderStyle;
      cell.font = { name: 'Segoe UI', size: 10 };
      if (col === 'B') cell.numFmt = '#,##0 ကျပ်';
    });
  });

  sheet6.columns = [
    { width: 30 },
    { width: 28 },
    { width: 28 },
    { width: 20 },
  ];

  applyCleanBackground(sheet6, 30, 8);

  // Generate Excel File buffer & trigger download safely

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


