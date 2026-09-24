import React, { useState } from 'react';
import { SaleRecord, TimePeriodFilter, Product, StockInRecord, ShopInfo, WasteRecord } from '../types';
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
  Ban,
  Clock,
} from 'lucide-react';
import { WasteTab } from './WasteTab';

interface ReportsTabProps {
  salesList: SaleRecord[];
  products?: Product[];
  stockInList?: StockInRecord[];
  wasteList?: WasteRecord[];
  shopInfo?: ShopInfo;
  accountPassword?: string;
  onOpenVoucher: (sale: SaleRecord) => void;
  onDeleteSale: (id: string, reason?: string) => void;
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
  onOpenVoucher,
  onDeleteSale,
  onRefundSale,
  onExportExcel,
  onDeleteStockIn,
  onDeleteWaste,
}) => {
  const [periodFilter, setPeriodFilter] = useState<TimePeriodFilter>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState<string>('All');
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showWasteView, setShowWasteView] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();

  // Helper date checker
  const matchesDateRange = (itemDateStr?: string) => {
    if (!itemDateStr) return true;
    const cleanDate = itemDateStr.split('T')[0].trim();
    if (startDate && endDate) {
      const minD = startDate <= endDate ? startDate : endDate;
      const maxD = startDate <= endDate ? endDate : startDate;
      return cleanDate >= minD && cleanDate <= maxD;
    } else if (startDate) {
      return cleanDate >= startDate;
    } else if (endDate) {
      return cleanDate <= endDate;
    } else if (periodFilter === 'today') {
      return cleanDate === todayStr;
    } else if (periodFilter === 'weekly') {
      const d = new Date(cleanDate);
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    } else if (periodFilter === 'monthly') {
      const d = new Date(cleanDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true; // 'custom' or all
  };

  // 1. Filtered Sales
  const getFilteredSales = () => {
    return salesList.filter((sale) => {
      if (!matchesDateRange(sale.date)) return false;

      // Search matching
      const matchesSearch =
        sale.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;

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
      if (!matchesProductAndType) return false;

      // Payment method matching
      if (paymentFilter !== 'All' && sale.paymentMethod !== paymentFilter) return false;

      // Status matching: All, Completed, Refunded, Cancelled
      if (statusFilter === 'Completed') {
        return sale.status !== 'Refunded' && sale.status !== 'Cancelled';
      }
      if (statusFilter === 'Refunded') {
        return sale.status === 'Refunded';
      }
      if (statusFilter === 'Cancelled') {
        return sale.status === 'Cancelled';
      }
      if (statusFilter === 'All') {
        // In All view, show Completed and Refunded sales
        return sale.status !== 'Cancelled';
      }

      return true;
    });
  };

  const filteredSales = getFilteredSales();

  // 2. Filtered Cancelled & Deleted Records ("ဖျက်သိမ်း")
  const cancelledSales = salesList
    .filter((s) => s.status === 'Cancelled')
    .filter((s) => matchesDateRange(s.date))
    .filter(
      (s) =>
        s.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const deletedWaste = (wasteList || [])
    .filter((w) => w.isDeleted)
    .filter((w) => matchesDateRange(w.date))
    .filter(
      (w) =>
        (w.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.productCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalCancelledSalesAmount = cancelledSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

  // 3. Refunded Sales Metrics
  const refundedSalesList = salesList
    .filter((s) => s.status === 'Refunded')
    .filter((s) => matchesDateRange(s.date))
    .filter(
      (s) =>
        s.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  const totalRefundedAmount = refundedSalesList.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
  const totalRefundedQty = refundedSalesList.reduce((sum, s) => sum + (s.totalQty || 0), 0);

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

  // Aggregate Metrics (Only calculate active non-refunded, non-cancelled sales)
  const activeSales = filteredSales.filter(
    (s) => s.status !== 'Refunded' && s.status !== 'Cancelled'
  );

  const totalRevenue = activeSales.reduce((sum, s) => {
    if (isAllFilter) return sum + (s.grandTotal || 0);
    const itemRev = getMatchingItems(s.items, s.saleType).reduce(
      (iSum, item) =>
        iSum +
        (item.totalAmount ||
          (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)),
      0
    );
    return sum + itemRev;
  }, 0);

  const totalQtySold = activeSales.reduce((sum, s) => {
    const items = isAllFilter ? s.items || [] : getMatchingItems(s.items, s.saleType);
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
        getMatchingItems(s.items, s.saleType).reduce(
          (iSum, item) =>
            iSum +
            (item.totalAmount ||
              (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)),
          0
        )
      );
    }, 0);

  const kpaySales = activeSales
    .filter((s) => s.paymentMethod === 'KPay' || s.paymentMethod === 'Wave')
    .reduce((sum, s) => {
      if (isAllFilter) return sum + s.grandTotal;
      return (
        sum +
        getMatchingItems(s.items, s.saleType).reduce(
          (iSum, item) =>
            iSum +
            (item.totalAmount ||
              (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)),
          0
        )
      );
    }, 0);

  const creditSales = activeSales
    .filter((s) => s.paymentMethod === 'Credit')
    .reduce((sum, s) => {
      if (isAllFilter) return sum + s.grandTotal;
      return (
        sum +
        getMatchingItems(s.items, s.saleType).reduce(
          (iSum, item) =>
            iSum +
            (item.totalAmount ||
              (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)),
          0
        )
      );
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>အရောင်းမှတ်တမ်းနှင့် အစီရင်ခံစာများ</span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                showWasteView
                  ? 'bg-rose-100 text-rose-700'
                  : statusFilter === 'Cancelled'
                  ? 'bg-rose-100 text-rose-700'
                  : statusFilter === 'Refunded'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {showWasteView
                ? 'Waste စာရင်း'
                : statusFilter === 'Cancelled'
                ? 'ဖျက်သိမ်းစာရင်း'
                : statusFilter === 'Refunded'
                ? 'Refunded စာရင်း'
                : 'Sales Reports'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {showWasteView
              ? 'Waste tab ရှိ စာရင်းများအတိုင်း တိုက်ရိုက် ကြည့်ရှုစစ်ဆေးနိုင်ပါသည်။'
              : statusFilter === 'Cancelled'
              ? 'ဖျက်သိမ်းထားသော ဘောင်ချာများနှင့် Waste စာရင်းများ'
              : statusFilter === 'Refunded'
              ? 'ငွေပြန်အမ်းထားသော ဘောင်ချာမှတ်တမ်းများ'
              : 'တစ်ရက်စာ၊ တစ်ပတ်စာ၊ တစ်လစာ အရောင်းစာရင်းများကို စစ်ဆေးကြည့်ရှုနိုင်ပါသည်။'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowWasteView(!showWasteView)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs border hover:shadow-md ${
              showWasteView
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
            }`}
            title="Waste စာရင်းနှင့် သက်တမ်းလွန် ကုန်ပစ္စည်းများကို ကြည့်ရှုမည်"
          >
            {showWasteView ? (
              <>
                <RotateCcw className="w-4 h-4 text-slate-300" />
                <span>အရောင်းစာရင်းသို့ ပြန်သွားရန်</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 text-rose-100" />
                <span>Waste စာရင်း</span>
              </>
            )}
          </button>

          {onExportExcel && !showWasteView && (
            <button
              onClick={onExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-emerald-500 hover:shadow-md"
              title="အရောင်းမှတ်တမ်း အစီရင်ခံစာများကို Excel (.xlsx) ဖိုင်အဖြစ် ဒေါင်းလုဒ်ဆွဲမည်"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>Excel (.xlsx) ဒေါင်းလုဒ်ဆွဲရန်</span>
              <Download className="w-3.5 h-3.5 text-emerald-200" />
            </button>
          )}
        </div>
      </div>

      {showWasteView ? (
        /* Waste Tab displayed directly inline under Sales Reports */
        <div className="space-y-6">
          <WasteTab
            products={products}
            stockInList={stockInList || []}
            wasteList={wasteList || []}
            shopInfo={shopInfo}
            onDeleteStockIn={onDeleteStockIn}
            onDeleteWaste={onDeleteWaste}
          />
        </div>
      ) : (
        <>
          {/* Filter Tabs & Secondary Filters */}
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

        {/* Secondary Filter Bar with 4 Options in Status Dropdown */}
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

          {/* Product Filter */}
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

          {/* Retail / Wholesale Filter */}
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

          {/* Start Date */}
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

          {/* End Date */}
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

          {/* Payment Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              ငွေရှင်းပုံစံ:
            </span>
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

          {/* Status Dropdown - 3 options: အားလုံး, Refunded, ဖျက်သိမ်း */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              အခြေအနေ:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full py-2 px-2 border rounded-xl text-xs focus:outline-none font-bold ${
                statusFilter === 'Cancelled'
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : statusFilter === 'Refunded'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
              }`}
            >
              <option value="All">အားလုံး</option>
              <option value="Refunded">Refunded</option>
              <option value="Cancelled">ဖျက်သိမ်း</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: CANCELLED & DELETED RECORDS ("ဖျက်သိမ်း") */}
      {statusFilter === 'Cancelled' ? (
        <div className="space-y-6">
          {/* KPI Summary for Cancelled */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">ဖျက်သိမ်းထားသော ဘောင်ချာတန်ဖိုး</p>
                <h3 className="text-xl font-bold text-rose-600">
                  {totalCancelledSalesAmount.toLocaleString()} ကျပ်
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Ban className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">ဖျက်သိမ်းထားသော ဘောင်ချာ</p>
                <h3 className="text-xl font-bold text-slate-800">
                  {cancelledSales.length} စောင်
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">ဖျက်ထားသော Waste စာရင်း</p>
                <h3 className="text-xl font-bold text-amber-700">
                  {deletedWaste.length} ခု
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Table 1: Cancelled Vouchers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>🚫 ဖျက်သိမ်းထားသော အရောင်းဘောင်ချာများ (Cancelled Vouchers Log)</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {cancelledSales.length} Vouchers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-rose-700 text-white font-semibold">
                    <th className="py-3 px-3 text-center border-r border-rose-600">ဘောင်ချာနံပါတ်</th>
                    <th className="py-3 px-3 text-center border-r border-rose-600">ရက်စွဲ</th>
                    <th className="py-3 px-3 text-center border-r border-rose-600 bg-rose-800">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ဖျက်သည့်အချိန်</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 border-r border-rose-600">ဝယ်သူအမည်</th>
                    <th className="py-3 px-4 border-r border-rose-600">ပစ္စည်းများ</th>
                    <th className="py-3 px-3 text-right border-r border-rose-600">စုစုပေါင်း ပမာဏ</th>
                    <th className="py-3 px-4">အကြောင်းပြချက်</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {cancelledSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        ဖျက်သိမ်းထားသော အရောင်းဘောင်ချာ မှတ်တမ်း မရှိပါ။
                      </td>
                    </tr>
                  ) : (
                    cancelledSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-rose-50/40 bg-white">
                        <td className="py-3 px-3 text-center font-bold text-rose-700 border-r border-slate-200">
                          {sale.voucherNo}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-200 text-slate-600">
                          {sale.date}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-200 font-mono text-xs text-rose-800 font-bold bg-rose-50/60">
                          {sale.deletedAt || sale.time || '-'}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-200 font-medium text-slate-900">
                          {sale.customerName}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-200 text-xs">
                          {sale.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                        </td>
                        <td className="py-3 px-3 text-right border-r border-slate-200 font-bold text-rose-600">
                          {(sale.grandTotal || 0).toLocaleString()} ကျပ်
                        </td>
                        <td className="py-3 px-4 text-slate-700 text-xs">
                          {sale.deleteReason || 'ဘောင်ချာအား ဖျက်သိမ်းလိုက်သည်'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Deleted Waste Records */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>🗑️ ဖျက်ထားသော Waste မှတ်တမ်းများ (Deleted Waste Log)</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {deletedWaste.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-amber-700 text-white font-semibold">
                    <th className="py-3 px-3 text-center border-r border-amber-600">စဉ်</th>
                    <th className="py-3 px-3 text-center border-r border-amber-600">ရက်စွဲ</th>
                    <th className="py-3 px-3 text-center border-r border-amber-600 bg-amber-800">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ဖျက်သည့်အချိန်</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center border-r border-amber-600">ကုဒ်</th>
                    <th className="py-3 px-4 border-r border-amber-600">ပစ္စည်းအမည်</th>
                    <th className="py-3 px-3 text-right border-r border-amber-600">အရေအတွက်</th>
                    <th className="py-3 px-3 text-right border-r border-amber-600">ဆုံးရှုံးငွေ</th>
                    <th className="py-3 px-4">အကြောင်းပြချက်</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {deletedWaste.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        ဖျက်ထားသော Waste မှတ်တမ်း မရှိပါ။
                      </td>
                    </tr>
                  ) : (
                    deletedWaste.map((w, idx) => (
                      <tr key={w.id} className="hover:bg-amber-50/40 bg-white">
                        <td className="py-3 px-3 text-center border-r border-slate-200 text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-200 text-slate-600">
                          {w.date}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-200 font-mono text-xs text-amber-900 font-bold bg-amber-50/60">
                          {w.deletedAt || '-'}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-200 font-mono text-xs">
                          {w.productCode}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-200 font-bold text-slate-900">
                          {w.productName}
                        </td>
                        <td className="py-3 px-3 text-right border-r border-slate-200 font-bold text-amber-700">
                          {(w.qty || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right border-r border-slate-200 font-bold text-rose-600">
                          {(w.lossAmount || 0).toLocaleString()} ကျပ်
                        </td>
                        <td className="py-3 px-4 text-slate-700 text-xs">
                          {w.reason || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : statusFilter === 'Refunded' ? (
        /* VIEW 2: REFUNDED SALES VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">စုစုပေါင်း ပြန်အမ်းငွေ (Refunded Total)</p>
                <h3 className="text-xl font-bold text-amber-700">
                  {totalRefundedAmount.toLocaleString()} ကျပ်
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">ပြန်အမ်းထားသော ဘောင်ချာအရေအတွက်</p>
                <h3 className="text-xl font-bold text-slate-800">
                  {refundedSalesList.length} စောင်
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">ပြန်အမ်းထားသော ပစ္စည်းအရေအတွက်</p>
                <h3 className="text-xl font-bold text-sky-700">
                  {totalRefundedQty.toLocaleString()} ခု
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Refunded Vouchers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>🔄 Refunded ဘောင်ချာမှတ်တမ်းများ</span>
              </h3>
              <span className="text-xs text-slate-500">
                {refundedSalesList.length} Refunded vouchers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-amber-700 text-white font-semibold">
                    <th className="py-3 px-3 text-center border-r border-amber-600">ဘောင်ချာနံပါတ်</th>
                    <th className="py-3 px-3 text-center border-r border-amber-600">ရက်စွဲ</th>
                    <th className="py-3 px-3 text-center border-r border-amber-600 bg-amber-800">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Refund အချိန်</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 border-r border-amber-600">ဝယ်သူအမည်</th>
                    <th className="py-3 px-4 border-r border-amber-600">ပစ္စည်းများ</th>
                    <th className="py-3 px-3 text-right border-r border-amber-600">ပြန်အမ်းငွေ</th>
                    <th className="py-3 px-4 border-r border-amber-600">အကြောင်းပြချက်</th>
                    <th className="py-3 px-3 text-center">ဘောင်ချာ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {refundedSalesList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        Refund ပြုလုပ်ထားသော ဘောင်ချာ မရှိပါ။
                      </td>
                    </tr>
                  ) : (
                    refundedSalesList.map((sale) => (
                      <tr key={sale.id} className="hover:bg-amber-50/40 bg-white">
                        <td className="py-3 px-3 text-center font-bold text-amber-800 border-r border-slate-200">
                          {sale.voucherNo}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-200 text-slate-600">
                          {sale.date}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-200 font-mono text-xs text-amber-900 font-bold bg-amber-50/60">
                          {sale.refundedAt || sale.time || '-'}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-200 font-medium text-slate-900">
                          {sale.customerName}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-200 text-xs">
                          {sale.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                        </td>
                        <td className="py-3 px-3 text-right border-r border-slate-200 font-bold text-rose-600">
                          {(sale.grandTotal || 0).toLocaleString()} ကျပ်
                        </td>
                        <td className="py-3 px-4 border-r border-slate-200 text-slate-700 text-xs">
                          {sale.refundReason || 'မှားယွင်းရောင်းချမှု ပယ်ဖျက်ခြင်း/Refund'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onOpenVoucher(sale)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-indigo-200"
                            title="ဘောင်ချာကြည့်မည်"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 3: NORMAL SALES (ALL or COMPLETED) */
        <>
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

          {/* Sales Transactions Table */}
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
                    <th className="py-3 px-3 text-center">လုပ်ဆောင်ချက်</th>
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
                              {sale.status === 'Refunded' ? (
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-200">
                                  Refunded
                                </span>
                              ) : sale.status === 'Cancelled' ? (
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold border border-rose-200">
                                  ဖျက်သိမ်းပြီး
                                </span>
                              ) : null}
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

                          <td
                            className={`py-3 px-4 border-r border-slate-200 font-medium ${
                              sale.status === 'Refunded' || sale.status === 'Cancelled'
                                ? 'line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {item.productName}
                          </td>

                          <td
                            className={`py-3 px-3 text-right border-r border-slate-200 font-semibold ${
                              sale.status === 'Refunded' || sale.status === 'Cancelled'
                                ? 'line-through text-slate-400'
                                : ''
                            }`}
                          >
                            {(item.quantity ?? (item as any).weightKg ?? 0).toLocaleString()}
                          </td>

                          <td
                            className={`py-3 px-3 text-right border-r border-slate-200 ${
                              sale.status === 'Refunded' || sale.status === 'Cancelled'
                                ? 'line-through text-slate-400'
                                : ''
                            }`}
                          >
                            {(item.unitPrice ?? (item as any).pricePerKg ?? 0).toLocaleString()} ကျပ်
                          </td>

                          <td
                            className={`py-3 px-4 text-right border-r border-slate-200 font-semibold ${
                              sale.status === 'Refunded' || sale.status === 'Cancelled'
                                ? 'line-through text-rose-400'
                                : 'text-indigo-700'
                            }`}
                          >
                            {(item.totalAmount ?? 0).toLocaleString()} ကျပ်
                          </td>

                          {itemIdx === 0 ? (
                            <td
                              rowSpan={displayItems.length}
                              className="py-3 px-3 text-center border-r border-slate-200 align-top"
                            >
                              <span
                                className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  sale.status === 'Refunded' || sale.status === 'Cancelled'
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
                                  type="button"
                                  onClick={() => onOpenVoucher(sale)}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-indigo-200 shadow-2xs"
                                  title="ဘောင်ချာကြည့်မည် / ရိုက်ထုတ်မည်"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>

                                {sale.status === 'Refunded' ? (
                                  <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 whitespace-nowrap">
                                    Refunded
                                  </span>
                                ) : sale.status === 'Cancelled' ? (
                                  <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 whitespace-nowrap">
                                    ဖျက်သိမ်းပြီး
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    {onRefundSale && (
                                      <button
                                        type="button"
                                        onClick={() => onRefundSale(sale.id)}
                                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md font-semibold text-xs flex items-center gap-1 border border-amber-200 transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                                        title="ဤအရောင်းဘောင်ချာကို Refund ပြုလုပ်မည်"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Refund</span>
                                      </button>
                                    )}

                                    {onDeleteSale && (
                                      <button
                                        type="button"
                                        onClick={() => onDeleteSale(sale.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="ဘောင်ချာအား ဖျက်သိမ်းမည် (ဖျက်သိမ်းစာရင်းသို့ ရောက်ရှိသွားပါမည်)"
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
        </>
      )}
    </div>
  );
};
