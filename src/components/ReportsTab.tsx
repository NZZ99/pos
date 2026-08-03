import React, { useState } from 'react';
import { SaleRecord, TimePeriodFilter } from '../types';
import {
  Calendar,
  Search,
  Printer,
  DollarSign,
  Scale,
  Receipt,
  CreditCard,
  Filter,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

interface ReportsTabProps {
  salesList: SaleRecord[];
  onOpenVoucher: (sale: SaleRecord) => void;
  onDeleteSale: (id: string) => void;
  onExportExcel?: () => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  salesList,
  onOpenVoucher,
  onDeleteSale,
  onExportExcel,
}) => {
  const [periodFilter, setPeriodFilter] = useState<TimePeriodFilter>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');

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

      return matchesPeriod && matchesSearch && matchesType && matchesPayment;
    });
  };

  const filteredSales = getFilteredSales();

  // Aggregate Metrics
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalWeightKg = filteredSales.reduce((sum, s) => sum + s.totalWeightKg, 0);
  const totalVouchers = filteredSales.length;

  const cashSales = filteredSales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((sum, s) => sum + s.grandTotal, 0);

  const kpaySales = filteredSales
    .filter((s) => s.paymentMethod === 'KPay' || s.paymentMethod === 'Wave')
    .reduce((sum, s) => sum + s.grandTotal, 0);

  const creditSales = filteredSales
    .filter((s) => s.paymentMethod === 'Credit')
    .reduce((sum, s) => sum + s.grandTotal, 0);

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
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

        {/* Total Weight Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">စုစုပေါင်း အလေးချိန် (KG)</p>
            <h3 className="text-xl font-bold text-slate-800">
              {totalWeightKg.toLocaleString()} KG
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
                <th className="py-3 px-3 text-center border-r border-indigo-600/50">Batch ID</th>
                <th className="py-3 px-3 text-right border-r border-indigo-600/50">အလေးချိန် (KG)</th>
                <th className="py-3 px-3 text-right border-r border-indigo-600/50">
                  ရောင်းဈေး (KG)
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
                  <td colSpan={11} className="py-12 text-center text-slate-400">
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
                          {sale.voucherNo}
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

                      <td className="py-3 px-4 border-r border-slate-200 font-medium text-slate-900">
                        {item.productName}
                      </td>

                      <td className="py-3 px-3 text-center border-r border-slate-200 text-xs text-slate-500">
                        {item.batchId || '-'}
                      </td>

                      <td className="py-3 px-3 text-right border-r border-slate-200 font-semibold">
                        {item.weightKg.toLocaleString()} KG
                      </td>

                      <td className="py-3 px-3 text-right border-r border-slate-200">
                        {item.pricePerKg.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right border-r border-slate-200 font-semibold text-indigo-700">
                        {item.totalAmount.toLocaleString()} ကျပ်
                      </td>

                      {itemIdx === 0 ? (
                        <td
                          rowSpan={sale.items.length}
                          className="py-3 px-3 text-center border-r border-slate-200 align-top"
                        >
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              sale.paymentMethod === 'Credit'
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
                          className="py-3 px-3 text-center align-top"
                        >
                          <button
                            onClick={() => onOpenVoucher(sale)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="ဘောင်ချာကြည့်မည်"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))
                )
              )}
            </tbody>
            <tfoot className="bg-indigo-50/80 font-bold text-slate-900 border-t-2 border-indigo-200 text-xs sm:text-sm">
              <tr>
                <td colSpan={6} className="py-3 px-4 text-right border-r border-slate-200">
                  စုစုပေါင်း (Total):
                </td>
                <td className="py-3 px-3 text-right border-r border-slate-200 text-indigo-800">
                  {totalWeightKg.toLocaleString()} KG
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
    </div>
  );
};
