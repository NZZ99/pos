import React, { useState } from 'react';
import { SaleRecord, TimePeriodFilter, Product, StockInRecord, ShopInfo, WasteRecord } from '../types';
import { WasteTab } from './WasteTab';
import {
  Calendar,
  Search,
  Printer,
  DollarSign,
  Scale,
  Receipt,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Trash2,
} from 'lucide-react';

interface ReportsTabProps {
  salesList: SaleRecord[];
  products?: Product[];
  stockInList?: StockInRecord[];
  wasteList?: WasteRecord[];
  shopInfo?: ShopInfo;
  accountPassword?: string;
  onOpenVoucher: (sale: SaleRecord) => void;
  onDeleteSale: (id: string) => void;
  onRefundSale?: (id: string, reason?: string) => void;
  onExportExcel?: () => void;
  onDeleteStockIn?: (id: string) => void;
  onDeleteWaste?: (id: string) => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  salesList,
  products = [],
  stockInList = [],
  wasteList = [],
  shopInfo,
  accountPassword,
  onOpenVoucher,
  onDeleteSale,
  onRefundSale,
  onExportExcel,
  onDeleteStockIn,
  onDeleteWaste,
}) => {
  const [reportType, setReportType] = useState<'sales' | 'waste'>('sales');
  const [periodFilter, setPeriodFilter] = useState<TimePeriodFilter>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState<string>('All');
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Helper date calculators
  const getFilteredSales = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    return salesList.filter((sale) => {
      // Time Period Filter (Start Date & End Date Range or Preset)
      const saleDateStr = sale.date ? sale.date.split('T')[0].trim() : '';
      let matchesPeriod = true;

      if (startDate && endDate) {
        const minD = startDate <= endDate ? startDate : endDate;
        const maxD = startDate <= endDate ? endDate : startDate;
        matchesPeriod = saleDateStr >= minD && saleDateStr <= maxD;
      } else if (startDate) {
        matchesPeriod = saleDateStr >= startDate;
      } else if (endDate) {
        matchesPeriod = saleDateStr <= endDate;
      } else if (periodFilter === 'today') {
        matchesPeriod = saleDateStr === todayStr;
      } else if (periodFilter === 'weekly') {
        const saleDate = new Date(saleDateStr);
        const diffDays = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);
        matchesPeriod = diffDays >= 0 && diffDays <= 7;
      } else if (periodFilter === 'monthly') {
        const saleDate = new Date(saleDateStr);
        matchesPeriod =
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear();
      }

      // Search matching
      const matchesSearch =
        sale.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));

      // Product & Sale Type matching on items
      const matchesProductAndType = sale.items.some((i) => {
        const pMatch =
          productFilter === 'All' ||
          (i.productName || '').trim().toLowerCase() === productFilter.trim().toLowerCase();
        const typeMatch =
          saleTypeFilter === 'All' ||
          i.saleType === saleTypeFilter ||
          (!i.saleType && sale.saleType === saleTypeFilter);
        return pMatch && typeMatch;
      });

      // Payment method matching
      const matchesPayment = paymentFilter === 'All' || sale.paymentMethod === paymentFilter;

      // Status matching
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Completed' && sale.status !== 'Refunded') ||
        (statusFilter === 'Refunded' && sale.status === 'Refunded');

      return matchesPeriod && matchesSearch && matchesProductAndType && matchesPayment && matchesStatus;
    });
  };

  const filteredSales = getFilteredSales();

  // Helper to get matching items for active filters
  const isAllFilter = productFilter === 'All' && saleTypeFilter === 'All';
  const getMatchingItems = (items: SaleRecord['items'], saleType?: string) => {
    return (items || []).filter((i) => {
      const pMatch =
        productFilter === 'All' ||
        (i.productName || '').trim().toLowerCase() === productFilter.trim().toLowerCase();
      const typeMatch =
        saleTypeFilter === 'All' ||
        i.saleType === saleTypeFilter ||
        (!i.saleType && saleType === saleTypeFilter);
      return pMatch && typeMatch;
    });
  };

  // Aggregate Metrics (Only calculate active non-refunded sales)
  const activeSales = filteredSales.filter((s) => s.status !== 'Refunded');

  const totalRevenue = activeSales.reduce((sum, s) => {
    if (isAllFilter) return sum + (s.grandTotal || 0);
    const itemRev = getMatchingItems(s.items, s.saleType)
      .reduce((iSum, item) => iSum + (item.totalAmount || ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))), 0);
    return sum + itemRev;
  }, 0);

  const totalQtySold = activeSales.reduce((sum, s) => {
    const items = isAllFilter ? (s.items || []) : getMatchingItems(s.items, s.saleType);
    const itemSum = items.reduce(
      (iSum, item) => iSum + (item.quantity ?? (item as any).weightKg ?? 0),
      0
    );
    return sum + itemSum;
  }, 0);

  const totalVouchers = activeSales.length;

  const cashSales = activeSales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((sum, s) => {
      if (isAllFilter) return sum + s.grandTotal;
      return (
        sum +
        getMatchingItems(s.items, s.saleType)
          .reduce((iSum, item) => iSum + (item.totalAmount || ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))), 0)
      );
    }, 0);

  const kpaySales = activeSales
    .filter((s) => s.paymentMethod === 'KPay' || s.paymentMethod === 'Wave')
    .reduce((sum, s) => {
      if (isAllFilter) return sum + s.grandTotal;
      return (
        sum +
        getMatchingItems(s.items, s.saleType)
          .reduce((iSum, item) => iSum + (item.totalAmount || ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))), 0)
      );
    }, 0);

  const creditSales = activeSales
    .filter((s) => s.paymentMethod === 'Credit')
    .reduce((sum, s) => {
      if (isAllFilter) return sum + s.grandTotal;
      return (
        sum +
        getMatchingItems(s.items, s.saleType)
          .reduce((iSum, item) => iSum + (item.totalAmount || ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))), 0)
      );
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>အရောင်းမှတ်တမ်းနှင့် အစီရင်ခံစာများ</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
              {reportType === 'sales' ? 'Sales Reports' : 'Waste Reports'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {reportType === 'sales'
              ? 'တစ်ရက်စာ၊ တစ်ပတ်စာ၊ တစ်လစာ အရောင်းစာရင်းများကို သီးခြားခွဲခြား ကြည့်ရှုစစ်ဆေးနိုင်ပါသည်။'
              : 'Expired Date သက်တမ်းကုန်ဆုံးသွားသော ပစ္စည်းများနှင့် Waste စာရင်း အစီရင်ခံစာဖြစ်ပါသည်။'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Report Type Selector: အရောင်း / Waste */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setReportType('sales')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                reportType === 'sales'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>အရောင်း စာရင်း</span>
            </button>
            <button
              type="button"
              onClick={() => setReportType('waste')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                reportType === 'waste'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🗑️ Waste စာရင်း</span>
            </button>
          </div>

          {reportType === 'sales' && onExportExcel && (
            <button
              onClick={onExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm border border-emerald-500 hover:shadow-md"
              title="အရောင်းမှတ်တမ်း အစီရင်ခံစာများကို Excel (.xlsx) ဖိုင်အဖြစ် ဒေါင်းလုဒ်ဆွဲမည်"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>Excel (.xlsx) ဒေါင်းလုဒ်ဆွဲရန်</span>
              <Download className="w-3.5 h-3.5 text-emerald-200" />
            </button>
          )}
        </div>
      </div>

      {reportType === 'waste' ? (
        <WasteTab
          products={products}
          stockInList={stockInList}
          wasteList={wasteList}
          shopInfo={shopInfo}
          onDeleteStockIn={onDeleteStockIn}
          onDeleteWaste={onDeleteWaste}
        />
      ) : (
        <>
          {/* Filter Tabs: တစ်ရက်စာ / တစ်ပတ်စာ / တစ်လစာ / အားလုံး */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">ကာလအလိုက် စာရင်းရွေးချယ်ရန်:</span>
                {(startDate || endDate) && (
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {startDate ? startDate : '...'} မှ {endDate ? endDate : '...'} ထိ
                  </span>
                )}
              </div>

              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setPeriodFilter('today');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    title="ရက်စွဲများကို မူလအတိုင်း ပြန်လည်သတ်မှတ်မည်"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>မူလအတိုင်းပြန်လည်သတ်မှတ်မည်</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setPeriodFilter('today');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !startDate && !endDate && periodFilter === 'today'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  တစ်ရက်စာ (Today)
                </button>
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setPeriodFilter('weekly');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !startDate && !endDate && periodFilter === 'weekly'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  တစ်ပတ်စာ (Weekly)
                </button>
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setPeriodFilter('monthly');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !startDate && !endDate && periodFilter === 'monthly'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  တစ်လစာ (Monthly)
                </button>
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setPeriodFilter('custom');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !startDate && !endDate && periodFilter === 'custom'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  စာရင်းအားလုံး (All)
                </button>
              </div>
            </div>

            {/* Secondary Filter Bar with Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-2 border-t border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ဘောင်ချာ၊ ဝယ်သူအမည်..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Product Name Filter Box */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  အမျိုးအစား:
                </span>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="w-full py-2 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
                >
                  <option value="All">အားလုံး</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Retail / Wholesale Filter Box (လက်လီ / လက်ကား) */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  အရောင်းပုံစံ:
                </span>
                <select
                  value={saleTypeFilter}
                  onChange={(e) => setSaleTypeFilter(e.target.value)}
                  className="w-full py-2 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-semibold text-slate-700"
                >
                  <option value="All">အားလုံး</option>
                  <option value="Retail">လက်လီ</option>
                  <option value="Wholesale">လက်ကား</option>
                </select>
              </div>

              {/* Start Date Picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  Start date:
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full py-1.5 px-2 bg-slate-50 border rounded-xl text-xs focus:outline-none font-medium ${
                    startDate
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-semibold'
                      : 'border-slate-200 text-slate-700 focus:border-indigo-500'
                  }`}
                  title="စတင်မည့်ရက် (Start date)"
                />
              </div>

              {/* End Date Picker - No ✕ button */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  End date:
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full py-1.5 px-2 bg-slate-50 border rounded-xl text-xs focus:outline-none font-medium ${
                    endDate
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-semibold'
                      : 'border-slate-200 text-slate-700 focus:border-indigo-500'
                  }`}
                  title="ပြီးဆုံးမည့်ရက် (End date)"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">ငွေရှင်းပုံစံ:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full py-2 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">အားလုံး</option>
                  <option value="Cash">Cash</option>
                  <option value="KPay">KPay/Wave</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">အခြေအနေ:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-semibold text-slate-700"
                >
                  <option value="All">အားလုံး</option>
                  <option value="Completed">ပြီးစီး</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">စုစုပေါင်း ရောင်းရငွေ</p>
            <h3 className="text-xl font-bold text-indigo-700">
              {totalRevenue.toLocaleString()} ကျပ်
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Quantity Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">စုစုပေါင်း ရောင်းရ အရေအတွက်</p>
            <h3 className="text-xl font-bold text-slate-800">
              {totalQtySold.toLocaleString()} ခု
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Total Vouchers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">ဘောင်ချာ အရေအတွက်</p>
            <h3 className="text-xl font-bold text-slate-800">{totalVouchers} စောင်</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-1.5 justify-center flex flex-col">
          <div className="flex justify-between">
            <span className="text-slate-500">💵 ငွေသား (Cash):</span>
            <span className="font-bold text-slate-800">{cashSales.toLocaleString()} ကျပ်</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">📱 KPay / Wave:</span>
            <span className="font-bold text-indigo-700">{kpaySales.toLocaleString()} ကျပ်</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">📝 အကြွေး (Credit):</span>
            <span className="font-bold text-rose-600">{creditSales.toLocaleString()} ကျပ်</span>
          </div>
        </div>
      </div>

      {/* Sales Transactions Table Replicating Image 2 - Section 2 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            အရောင်းမှတ်တမ်း အသေးစိတ်ဇယား (Sales Log Details)
          </h3>
          <span className="text-xs text-slate-500">
            {filteredSales.length} Transactions found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-indigo-700 text-white font-semibold tracking-wide">
                <th className="py-3 px-3 text-center border-r border-indigo-600/50">
                  ဘောင်ချာနံပါတ်
                </th>
                <th className="py-3 px-3 text-center border-r border-indigo-600/50">ရက်စွဲ</th>
                <th className="py-3 px-4 border-r border-indigo-600/50">ဝယ်သူအမည်</th>
                <th className="py-3 px-3 text-center border-r border-indigo-600/50">အမျိုးအစား</th>
                <th className="py-3 px-4 border-r border-indigo-600/50">ပစ္စည်းအမည်</th>
                <th className="py-3 px-3 text-right border-r border-indigo-600/50">အရေအတွက်</th>
                <th className="py-3 px-3 text-right border-r border-indigo-600/50">
                  ရောင်းဈေး
                </th>
                <th className="py-3 px-4 text-right border-r border-indigo-600/50">
                  အသားတင်ကျသင့်ငွေ
                </th>
                <th className="py-3 px-3 text-center border-r border-indigo-600/50">ငွေရှင်းပုံစံ</th>
                <th className="py-3 px-3 text-center">ဘောင်ချာ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    ရွေးချယ်ထားသော စစ်ထုတ်ချက်နှင့် ကိုက်ညီသော အရောင်းမှတ်တမ်းမရှိပါ။
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const displayItems = isAllFilter
                    ? sale.items
                    : getMatchingItems(sale.items, sale.saleType);

                  if (displayItems.length === 0) return null;

                  return displayItems.map((item, itemIdx) => (
                    <tr
                      key={`${sale.id}-${itemIdx}-${item.productName}`}
                      className="hover:bg-indigo-50/40 transition-colors bg-white"
                    >
                      {itemIdx === 0 ? (
                        <td
                          rowSpan={displayItems.length}
                          className="py-3 px-3 text-center border-r border-slate-200 font-semibold text-indigo-700 align-top"
                        >
                          <div>{sale.voucherNo}</div>
                          {sale.status === 'Refunded' && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold border border-rose-200">
                              ပယ်ဖျက်ပြီး
                            </span>
                          )}
                        </td>
                      ) : null}

                      {itemIdx === 0 ? (
                        <td
                          rowSpan={displayItems.length}
                          className="py-3 px-3 text-center border-r border-slate-200 text-slate-600 text-xs align-top"
                        >
                          {sale.date}
                        </td>
                      ) : null}

                      {itemIdx === 0 ? (
                        <td
                          rowSpan={displayItems.length}
                          className="py-3 px-4 border-r border-slate-200 font-medium text-slate-900 align-top"
                        >
                          {sale.customerName}
                        </td>
                      ) : null}

                      <td className="py-3 px-3 text-center border-r border-slate-200">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            item.saleType === 'Wholesale'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {item.saleType === 'Wholesale' ? 'လက်ကား' : 'လက်လီ'}
                        </span>
                      </td>

                      <td className={`py-3 px-4 border-r border-slate-200 font-medium ${sale.status === 'Refunded' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.productName}
                      </td>

                      <td className={`py-3 px-3 text-right border-r border-slate-200 font-semibold ${sale.status === 'Refunded' ? 'line-through text-slate-400' : ''}`}>
                        {(item.quantity ?? (item as any).weightKg ?? 0).toLocaleString()}
                      </td>

                      <td className={`py-3 px-3 text-right border-r border-slate-200 ${sale.status === 'Refunded' ? 'line-through text-slate-400' : ''}`}>
                        {(item.unitPrice ?? (item as any).pricePerKg ?? 0).toLocaleString()} ကျပ်
                      </td>

                      <td className={`py-3 px-4 text-right border-r border-slate-200 font-semibold ${sale.status === 'Refunded' ? 'line-through text-rose-400' : 'text-indigo-700'}`}>
                        {(item.totalAmount ?? 0).toLocaleString()} ကျပ်
                      </td>

                      {itemIdx === 0 ? (
                        <td
                          rowSpan={displayItems.length}
                          className="py-3 px-3 text-center border-r border-slate-200 align-top"
                        >
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              sale.status === 'Refunded'
                                ? 'bg-slate-100 text-slate-500 line-through'
                                : sale.paymentMethod === 'Credit'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {sale.paymentMethod}
                          </span>
                        </td>
                      ) : null}

                      {itemIdx === 0 ? (
                        <td
                          rowSpan={displayItems.length}
                          className="py-3 px-3 text-center align-top border-r border-slate-200"
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenVoucher(sale)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-indigo-200 shadow-2xs"
                              title="ဘောင်ချာကြည့်မည် / ရိုက်ထုတ်မည်"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {sale.status === 'Refunded' ? (
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 whitespace-nowrap">
                                  Refunded
                                </span>
                                {onDeleteSale && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteSale(sale.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="စာရင်းမှ လုံးဝဖျက်ပစ်မည်"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                {onRefundSale && (
                                  <button
                                    type="button"
                                    onClick={() => onRefundSale(sale.id)}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md font-semibold text-xs flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                                    title="ဤအရောင်းမှတ်တမ်းကို ပယ်ဖျက်ပြီး Refund ပြုလုပ်မည် (စတော့ကျန် စာရင်းထဲသို့ ကုန်ပစ္စည်း ပြန်လည် ဝင်ရောက်သွားပါမည်)"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Refund</span>
                                  </button>
                                )}

                                {onDeleteSale && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteSale(sale.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="စာရင်းမှ ဖျက်မည်"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ));
                })
              )}
            </tbody>
            <tfoot className="bg-indigo-50/80 font-bold text-slate-900 border-t-2 border-indigo-200 text-xs sm:text-sm">
              <tr>
                <td colSpan={5} className="py-3 px-4 text-right border-r border-slate-200">
                  စုစုပေါင်း (Total):
                </td>
                <td className="py-3 px-3 text-right border-r border-slate-200 text-indigo-800">
                  {totalQtySold.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center border-r border-slate-200">-</td>
                <td className="py-3 px-4 text-right border-r border-slate-200 text-indigo-800">
                  {totalRevenue.toLocaleString()} ကျပ်
                </td>
                <td colSpan={2} className="py-3 px-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
