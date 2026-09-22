import React, { useState } from 'react';
import { Product, StockInRecord, ShopInfo } from '../types';
import {
  AlertTriangle,
  Search,
  Calendar,
  DollarSign,
  Package,
  Clock,
  Printer,
  AlertOctagon,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface WasteTabProps {
  products: Product[];
  stockInList: StockInRecord[];
  shopInfo?: ShopInfo;
  onDeleteStockIn?: (id: string) => void;
}

export const WasteTab: React.FC<WasteTabProps> = ({
  products,
  stockInList,
  shopInfo,
  onDeleteStockIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'expired' | 'soon' | 'all'>('expired');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Helper to calculate days diff
  const getDaysDifference = (dateStr: string) => {
    if (!dateStr) return 0;
    const targetDate = new Date(dateStr + 'T00:00:00');
    const currDate = new Date(todayStr + 'T00:00:00');
    const diffTime = targetDate.getTime() - currDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Process all stock-in records with expiry dates
  const batchList = stockInList
    .filter((s) => Boolean(s.expiryDate))
    .map((s) => {
      const daysDiff = getDaysDifference(s.expiryDate);
      const isExpired = s.expiryDate < todayStr;
      const isToday = s.expiryDate === todayStr;
      const isExpiringSoon = !isExpired && !isToday && daysDiff <= 7 && daysDiff > 0;
      const lossAmount = (s.qty || 0) * (s.purchasePrice || 0);

      const matchedProduct = products.find((p) => p.code === s.productCode);
      const unit = matchedProduct?.unit || 'ခု';

      return {
        ...s,
        daysDiff,
        isExpired: isExpired || isToday,
        isToday,
        isExpiringSoon,
        lossAmount,
        unit,
      };
    });

  // Filtered lists
  const expiredBatches = batchList.filter((b) => b.isExpired);
  const expiringSoonBatches = batchList.filter((b) => b.isExpiringSoon);

  const displayBatches = batchList
    .filter((b) => {
      if (filterType === 'expired') return b.isExpired;
      if (filterType === 'soon') return b.isExpiringSoon;
      return true;
    })
    .filter((b) => {
      const q = searchTerm.toLowerCase();
      return (
        b.productName.toLowerCase().includes(q) ||
        b.productCode.toLowerCase().includes(q) ||
        (b.storageLocation && b.storageLocation.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

  // Summary Metrics
  const totalExpiredCount = expiredBatches.length;
  const totalExpiredQty = expiredBatches.reduce((sum, b) => sum + (b.qty || 0), 0);
  const totalLossValue = expiredBatches.reduce((sum, b) => sum + b.lossAmount, 0);
  const totalExpiringSoonCount = expiringSoonBatches.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="waste-printable-area" className="space-y-6">
      {/* Print-Only Header Banner */}
      <div className="hidden print:block mb-6 text-center border-b-2 border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">{shopInfo?.name || 'အအေးခဲ အသားငါး အရောင်းဆိုင်'}</h1>
        <p className="text-sm font-semibold text-slate-700 mt-1">🗑️ သက်တမ်းလွန် / စွန့်ပစ် ကုန်ပစ္စည်းများ စာရင်း အစီရင်ခံစာ (Waste Report)</p>
        <div className="flex justify-between items-center text-xs text-slate-600 mt-2">
          <span>ထုတ်ယူသည့် ရက်စွဲ: {todayStr}</span>
          <span>ဖုန်း: {shopInfo?.phone || '-'}</span>
          <span>စုစုပေါင်း သက်တမ်းကုန်ပစ္စည်း: {displayBatches.length} သုတ်</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🗑️ စွန့်ပစ် / သက်တမ်းလွန် စာရင်းများ</span>
            <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full">
              Waste & Expiry Management
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Expired Date သက်တမ်းကုန်ဆုံးသွားသော ပစ္စည်းများ အလိုအလျောက် ရောက်ရှိလာမည့် Waste စာရင်းဖြစ်ပါသည်။
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>စာရင်း ထုတ်ယူရန် (Print)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expired Batches */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">သက်တမ်းကုန် ကုန်ပစ္စည်းအသုတ်</p>
            <h3 className="text-2xl font-bold text-rose-600">
              {totalExpiredCount.toLocaleString()} <span className="text-sm font-normal text-slate-500">သုတ်</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Expired Quantity */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">သက်တမ်းလွန် အရေအတွက်ပေါင်း</p>
            <h3 className="text-2xl font-bold text-amber-600">
              {totalExpiredQty.toLocaleString()} <span className="text-sm font-normal text-slate-500">ခု</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Financial Loss Amount */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">ဆုံးရှုံးမှု တန်ဖိုးပမာဏ</p>
            <h3 className="text-2xl font-bold text-rose-700">
              {totalLossValue.toLocaleString()} <span className="text-sm font-normal text-slate-500">ကျပ်</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Expiring Soon (7 Days) */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">၇ ရက်အတွင်း သက်တမ်းကုန်မည့်စာရင်း</p>
            <h3 className="text-2xl font-bold text-indigo-600">
              {totalExpiringSoonCount.toLocaleString()} <span className="text-sm font-normal text-slate-500">သုတ်</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setFilterType('expired')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'expired'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              သက်တမ်းကုန်လွန် စာရင်း ({totalExpiredCount})
            </button>
            <button
              onClick={() => setFilterType('soon')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'soon'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ၇ ရက်အတွင်း ကုန်မည့်စာရင်း ({totalExpiringSoonCount})
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              သက်တမ်းရှိ စာရင်းအားလုံး ({batchList.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="ပစ္စည်းအမည်၊ ကုဒ်၊ နေရာ ရှာရန်..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold tracking-wide">
                <th className="py-3 px-4 text-center border-r border-slate-800">စဉ်</th>
                <th className="py-3 px-4 border-r border-slate-800">ကုန်ပစ္စည်းကုဒ်</th>
                <th className="py-3 px-5 border-r border-slate-800">ကုန်ပစ္စည်းအမည်</th>
                <th className="py-3 px-4 text-center border-r border-slate-800">အဝင်ရက်စွဲ</th>
                <th className="py-3 px-4 text-center border-r border-slate-800">သက်တမ်းကုန်ရက်</th>
                <th className="py-3 px-4 text-right border-r border-slate-800">အရေအတွက်</th>
                <th className="py-3 px-4 text-right border-r border-slate-800">ဝယ်ဈေး (၁ ခု)</th>
                <th className="py-3 px-4 text-right border-r border-slate-800">ဆုံးရှုံးမှုတန်ဖိုး</th>
                <th className="py-3 px-4 text-center border-r border-slate-800">သိမ်းဆည်းနေရာ</th>
                <th className="py-3 px-4 text-center">အခြေအနေ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {displayBatches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                      <p className="font-semibold text-slate-700">သက်တမ်းကုန်/စွန့်ပစ်ရမည့် ပစ္စည်း မရှိပါ</p>
                      <p className="text-xs text-slate-400">စတော့အဝင်တွင် Expiry Date ကုန်ဆုံးသွားပါက ဤစာရင်းတွင် အလိုအလျောက် ပေါ်လာမည်ဖြစ်ပါသည်။</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayBatches.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.isExpired
                        ? 'bg-rose-50/40'
                        : item.isExpiringSoon
                        ? 'bg-amber-50/40'
                        : idx % 2 === 1
                        ? 'bg-slate-50/40'
                        : 'bg-white'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center text-slate-500 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 border-r border-slate-200">
                      {item.productCode}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-900 border-r border-slate-200">
                      {item.productName}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3.5 px-4 text-center border-r border-slate-200 whitespace-nowrap">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                          item.isExpired
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : item.isExpiringSoon
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.expiryDate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right border-r border-slate-200 font-semibold text-slate-900">
                      {(item.qty ?? 0).toLocaleString()} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right border-r border-slate-200 text-slate-600">
                      {(item.purchasePrice ?? 0).toLocaleString()} ကျပ်
                    </td>
                    <td className="py-3.5 px-4 text-right border-r border-slate-200 font-bold text-rose-600">
                      {(item.lossAmount ?? 0).toLocaleString()} ကျပ်
                    </td>
                    <td className="py-3.5 px-4 text-center border-r border-slate-200 text-slate-600">
                      {item.storageLocation || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.isExpired ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>သက်တမ်းကုန် (Waste)</span>
                        </span>
                      ) : item.isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{item.daysDiff} ရက်အတွင်း ကုန်မည်</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>သက်တမ်းရှိသေး</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {displayBatches.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-center border-r border-slate-200">
                    စုစုပေါင်း (Total)
                  </td>
                  <td className="py-3 px-4 text-right border-r border-slate-200 text-indigo-700">
                    {displayBatches.reduce((s, b) => s + (b.qty || 0), 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right border-r border-slate-200">-</td>
                  <td className="py-3 px-4 text-right border-r border-slate-200 text-rose-600">
                    {displayBatches.reduce((s, b) => s + b.lossAmount, 0).toLocaleString()} ကျပ်
                  </td>
                  <td colSpan={2} className="py-3 px-4 text-center"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
