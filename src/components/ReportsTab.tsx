import React, { useState } from 'react';
import { SaleRecord, TimePeriodFilter } from '../types';
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
  onOpenVoucher: (sale: SaleRecord) => void;
  onDeleteSale: (id: string) => void;
  onRefundSale?: (id: string, reason?: string) => void;
  onExportExcel?: () => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  salesList,
  onOpenVoucher,
  onDeleteSale,
  onRefundSale,
  onExportExcel,
}) => {
  const [periodFilter, setPeriodFilter] = useState<TimePeriodFilter>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals for iframe-safe confirmation
  const [refundModalSale, setRefundModalSale] = useState<SaleRecord | null>(null);
  const [refundReason, setRefundReason] = useState<string>('မှားယွင်းရောင်းချမိခြင်း / ပစ္စည်းပြန်အမ်းခြင်း');
  const [deleteModalSale, setDeleteModalSale] = useState<SaleRecord | null>(null);

  // Helper date calculators
  const getFilteredSales = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    return salesList.filter((sale) => {
      // Time Period Filter
      const saleDate = new Date(sale.date);
      let matchesPeriod = true;

      if (periodFilter === 'today') {
        matchesPeriod = sale.date === todayStr;
      } else if (periodFilter === 'weekly') {
        const diffDays = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);
        matchesPeriod = diffDays >= 0 && diffDays <= 7;
      } else if (periodFilter === 'monthly') {
        matchesPeriod =
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear();
      }

      // Search matching
      const matchesSearch =
        sale.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));

      // Sale Type matching
      const matchesType = saleTypeFilter === 'All' || sale.saleType === saleTypeFilter;

      // Payment method matching
      const matchesPayment = paymentFilter === 'All' || sale.paymentMethod === paymentFilter;

      // Status matching
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Completed' && sale.status !== 'Refunded') ||
        (statusFilter === 'Refunded' && sale.status === 'Refunded');

      return matchesPeriod && matchesSearch && matchesType && matchesPayment && matchesStatus;
    });
  };

  const filteredSales = getFilteredSales();

  // Aggregate Metrics (Only calculate active non-refunded sales)
  const activeSales = filteredSales.filter((s) => s.status !== 'Refunded');

  const totalRevenue = activeSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
  const totalQtySold = activeSales.reduce((sum, s) => {
    if (s.totalQty !== undefined) return sum + s.totalQty;
    const itemSum = (s.items || []).reduce((iSum, item) => iSum + (item.quantity ?? (item as any).weightKg ?? 0), 0);
    return sum + itemSum;
  }, 0);
  const totalVouchers = activeSales.length;

  const cashSales = activeSales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((sum, s) => sum + s.grandTotal, 0);

  const kpaySales = activeSales
    .filter((s) => s.paymentMethod === 'KPay' || s.paymentMethod === 'Wave')
    .reduce((sum, s) => sum + s.grandTotal, 0);

  const creditSales = activeSales
    .filter((s) => s.paymentMethod === 'Credit')
    .reduce((sum, s) => sum + s.grandTotal, 0);

  const handleRefundClick = (sale: SaleRecord) => {
    setRefundModalSale(sale);
    setRefundReason('မှားယွင်းရောင်းချမိခြင်း / ပစ္စည်းပြန်အမ်းခြင်း');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>အရောင်းမှတ်တမ်းနှင့် အစီရင်ခံစာများ</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
              Sales Reports
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            တစ်ရက်စာ၊ တစ်ပတ်စာ၊ တစ်လစာ စာရင်းများကို သီးခြားခွဲခြား ကြည့်ရှုစစ်ဆေးနိုင်ပါသည်။
          </p>
        </div>

        {onExportExcel && (
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

      {/* Filter Tabs: တစ်ရက်စာ / တစ်ပတ်စာ / တစ်လစာ / အားလုံး */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">ကာလအလိုက် စာရင်းရွေးချယ်ရန်:</span>
          </div>

          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setPeriodFilter('today')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodFilter === 'today'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              တစ်ရက်စာ (Today)
            </button>
            <button
              onClick={() => setPeriodFilter('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodFilter === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              တစ်ပတ်စာ (Weekly)
            </button>
            <button
              onClick={() => setPeriodFilter('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodFilter === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              တစ်လစာ (Monthly)
            </button>
            <button
              onClick={() => setPeriodFilter('custom')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodFilter === 'custom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              စာရင်းအားလုံး (All)
            </button>
          </div>
        </div>

        {/* Secondary Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="ဘောင်ချာ၊ ဝယ်သူအမည် သို့မဟုတ် ပစ္စည်း..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              အမျိုးအစား:
            </span>
            <select
              value={saleTypeFilter}
              onChange={(e) => setSaleTypeFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="All">အားလုံး (All Types)</option>
              <option value="Retail">လက်လီ (Retail)</option>
              <option value="Wholesale">လက်ကား (Wholesale)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">ငွေရှင်းပုံစံ:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="All">အားလုံး (All Payments)</option>
              <option value="Cash">Cash (ငွေသား)</option>
              <option value="KPay">KPay / Wave</option>
              <option value="Credit">Credit (အကြွေး)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">အခြေအနေ:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-semibold text-slate-700"
            >
              <option value="All">အားလုံး (All Status)</option>
              <option value="Completed">အရောင်းပြီးစီး (Completed)</option>
              <option value="Refunded">Refund ပြုလုပ်ထားသော (Refunded)</option>
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
                filteredSales.map((sale) =>
                  sale.items.map((item, itemIdx) => (
                    <tr
                      key={`${sale.id}-${itemIdx}`}
                      className="hover:bg-indigo-50/40 transition-colors bg-white"
                    >
                      {itemIdx === 0 ? (
                        <td
                          rowSpan={sale.items.length}
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
                          rowSpan={sale.items.length}
                          className="py-3 px-3 text-center border-r border-slate-200 text-slate-600 text-xs align-top"
                        >
                          {sale.date}
                        </td>
                      ) : null}

                      {itemIdx === 0 ? (
                        <td
                          rowSpan={sale.items.length}
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
                          rowSpan={sale.items.length}
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
                          rowSpan={sale.items.length}
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
                                    onClick={() => setDeleteModalSale(sale)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="စာရင်းမှ လုံးဝဖျက်ပစ်မည်"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleRefundClick(sale)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md font-semibold text-xs flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                                  title="ဤအရောင်းမှတ်တမ်းကို ပယ်ဖျက်ပြီး Refund ပြုလုပ်မည် (စတော့ကျန် စာရင်းထဲသို့ ကုန်ပစ္စည်း ပြန်လည် ဝင်ရောက်သွားပါမည်)"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Refund</span>
                                </button>

                                {onDeleteSale && (
                                  <button
                                    onClick={() => setDeleteModalSale(sale)}
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
                  ))
                )
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

      {/* Refund Modal */}
      {refundModalSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b pb-3 border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">အရောင်းဘောင်ချာ Refund ပြုလုပ်ရန်</h3>
                <p className="text-xs text-slate-500">ဘောင်ချာအမှတ်: <span className="font-bold text-slate-800">{refundModalSale.voucherNo}</span></p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">ဝယ်သူအမည်:</span>
                <span className="font-bold">{refundModalSale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ရောင်းရငွေ:</span>
                <span className="font-bold text-rose-600">{(refundModalSale.grandTotal || 0).toLocaleString()} ကျပ်</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ပစ္စည်းများ:</span>
                <span className="font-semibold text-right max-w-[200px] truncate">
                  {refundModalSale.items.map((i) => i.productName).join(', ')}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 space-y-1">
              <p className="font-bold">⚠️ Refund ပြုလုပ်ပါက အောက်ပါအတိုင်း ဖြစ်ပါမည်:</p>
              <p>• ဤအရောင်းဘောင်ချာကို "ပယ်ဖျက်ပြီး (Refunded)" အဖြစ် ပြောင်းလဲပါမည်။</p>
              <p>• ရောင်းချခဲ့သော ကုန်ပစ္စည်းများသည် <strong>စတော့ကျန် စာရင်းထဲသို့ အလိုအလျောက် ပြန်လည်ဝင်ရောက် သွားပါမည်</strong>။</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Refund ပြုလုပ်ရသည့် အကြောင်းအရင်း (မှတ်ချက်):
              </label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                placeholder="ဥပမာ- မှားယွင်းရောင်းချမိခြင်း / ပစ္စည်းပြန်အမ်းခြင်း..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRefundModalSale(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                မပြုလုပ်ပါ (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onRefundSale) {
                    onRefundSale(refundModalSale.id, refundReason);
                  }
                  setRefundModalSale(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>အတည်ပြုမည် (Confirm Refund)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b pb-3 border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">အရောင်းမှတ်တမ်း ဖျက်ရန်</h3>
                <p className="text-xs text-slate-500">ဘောင်ချာ: {deleteModalSale.voucherNo}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ဤအရောင်းမှတ်တမ်းကို စနစ်ထဲမှ လုံးဝ ဖျက်ပစ်ရန် သေချာပါသလား?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalSale(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                မဖျက်ပါ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteSale) {
                    onDeleteSale(deleteModalSale.id);
                  }
                  setDeleteModalSale(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                ဖျက်မည် (Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
