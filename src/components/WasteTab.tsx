import React, { useState } from 'react';
import { Product, StockInRecord, WasteRecord, ShopInfo } from '../types';
import {
  AlertTriangle,
  Search,
  DollarSign,
  Package,
  Clock,
  Printer,
  AlertOctagon,
  Trash2,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';

interface WasteTabProps {
  products: Product[];
  stockInList: StockInRecord[];
  wasteList?: WasteRecord[];
  shopInfo?: ShopInfo;
  onDeleteStockIn?: (id: string) => void;
  onDeleteWaste?: (id: string) => void;
}

export const WasteTab: React.FC<WasteTabProps> = ({
  products,
  stockInList,
  wasteList = [],
  shopInfo,
  onDeleteStockIn,
  onDeleteWaste,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'manual' | 'expired'>('all');

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

  // 1. Process ONLY expired stock-in records
  const expiredBatches = stockInList
    .filter((s) => Boolean(s.expiryDate) && (s.qty || 0) > 0 && s.expiryDate <= todayStr)
    .map((s) => {
      const daysDiff = getDaysDifference(s.expiryDate);
      const isExpired = s.expiryDate < todayStr;
      const isToday = s.expiryDate === todayStr;
      const lossAmount = (s.qty || 0) * (s.purchasePrice || 0);

      const matchedProduct = products.find((p) => p.code === s.productCode);
      const unit = matchedProduct?.unit || 'ခု';

      return {
        id: s.id,
        sourceType: 'StockInExpiry' as const,
        date: s.date,
        productCode: s.productCode,
        productName: s.productName,
        qty: s.qty || 0,
        purchasePrice: s.purchasePrice || 0,
        lossAmount,
        expiryDate: s.expiryDate,
        storageLocation: s.storageLocation || '-',
        reason: isToday ? 'ယနေ့ သက်တမ်းကုန်လွန်' : 'ရက်လွန် သက်တမ်းကုန်ဆုံးမှု',
        daysDiff,
        isExpired: true,
        isToday,
        isExpiringSoon: false,
        unit,
      };
    });

  // 2. Process manual waste entries
  const manualWasteEntries = wasteList.map((w) => {
    const matchedProduct = products.find((p) => p.code === w.productCode);
    const unit = matchedProduct?.unit || 'ခု';
    return {
      id: w.id,
      sourceType: 'ManualWaste' as const,
      date: w.date,
      productCode: w.productCode,
      productName: w.productName,
      qty: w.qty,
      purchasePrice: w.purchasePrice,
      lossAmount: w.lossAmount,
      expiryDate: '-',
      storageLocation: '-',
      reason: w.reason || 'လူကြောင့် ပျက်စီး/အလေအလွင့်ဖြစ်ခြင်း',
      daysDiff: 0,
      isExpired: false,
      isToday: false,
      isExpiringSoon: false,
      unit,
    };
  });

  // Combined records for display - ONLY Manual Waste and Expired batches
  const combinedList = [
    ...manualWasteEntries,
    ...expiredBatches,
  ];

  const filteredDisplayList = combinedList
    .filter((item) => {
      if (filterType === 'manual') return item.sourceType === 'ManualWaste';
      if (filterType === 'expired') return item.sourceType === 'StockInExpiry';
      return true;
    })
    .filter((item) => {
      const q = searchTerm.toLowerCase();
      return (
        item.productName.toLowerCase().includes(q) ||
        item.productCode.toLowerCase().includes(q) ||
        (item.reason && item.reason.toLowerCase().includes(q))
      );
    });

  // Summary Metrics
  const totalManualCount = manualWasteEntries.length;
  const totalManualLoss = manualWasteEntries.reduce((sum, m) => sum + m.lossAmount, 0);
  const totalManualQty = manualWasteEntries.reduce((sum, m) => sum + m.qty, 0);

  const totalExpiredCount = expiredBatches.length;
  const totalExpiredQty = expiredBatches.reduce((sum, b) => sum + b.qty, 0);
  const totalExpiredLoss = expiredBatches.reduce((sum, b) => sum + b.lossAmount, 0);

  const grandTotalLossValue = totalManualLoss + totalExpiredLoss;
  const grandTotalWasteQty = totalManualQty + totalExpiredQty;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="waste-printable-area" className="space-y-6">
      {/* Print-Only Header Banner */}
      <div className="hidden print:block mb-6 text-center border-b-2 border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">{shopInfo?.name || 'အအေးခဲ အသားငါး အရောင်းဆိုင်'}</h1>
        <p className="text-sm font-semibold text-slate-700 mt-1">🗑️ စွန့်ပစ်/ပျက်စီး/သက်တမ်းလွန် ကုန်ပစ္စည်းများ စာရင်း အစီရင်ခံစာ (Waste Report)</p>
        <div className="flex justify-between items-center text-xs text-slate-600 mt-2">
          <span>ထုတ်ယူသည့် ရက်စွဲ: {todayStr}</span>
          <span>ဖုန်း: {shopInfo?.phone || '-'}</span>
          <span>စုစုပေါင်း Waste & သက်တမ်းကုန်ပစ္စည်း: {filteredDisplayList.length} ခု</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🗑️ စွန့်ပစ် / Waste & သက်တမ်းလွန် စာရင်းများ</span>
            <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full">
              Waste Management Sheet
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ပစ္စည်းအဝင်မှ လူကိုယ်တိုင် နုတ်ယူထားသော Waste စာရင်းများနှင့် သက်တမ်းကုန်ဆုံးသွားသော ပစ္စည်းများ စုစည်းပြသသည့် ဇယားဖြစ်ပါသည်။
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Waste Entries */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">လူကိုယ်တိုင် Waste + သက်တမ်းကုန်</p>
            <h3 className="text-2xl font-bold text-rose-600">
              {(totalManualCount + totalExpiredCount).toLocaleString()} <span className="text-sm font-normal text-slate-500">ခု</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Waste Quantity */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">စွန့်ပစ်/ဆုံးရှုံး အရေအတွက်ပေါင်း</p>
            <h3 className="text-2xl font-bold text-amber-600">
              {grandTotalWasteQty.toLocaleString()} <span className="text-sm font-normal text-slate-500">ခု</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Financial Loss Amount */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">စုစုပေါင်း ဆုံးရှုံးမှု တန်ဖိုး</p>
            <h3 className="text-2xl font-bold text-rose-700">
              {grandTotalLossValue.toLocaleString()} <span className="text-sm font-normal text-slate-500">ကျပ်</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              စာရင်းအားလုံး ({combinedList.length})
            </button>
            <button
              onClick={() => setFilterType('manual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'manual'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              လူကိုယ်တိုင် Waste ({totalManualCount})
            </button>
            <button
              onClick={() => setFilterType('expired')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'expired'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              သက်တမ်းကုန်လွန် ({totalExpiredCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="ပစ္စည်းအမည်၊ ကုဒ်၊ အကြောင်းအရင်း ရှာရန်..."
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
                <th className="py-3 px-3 text-center border-r border-slate-800">စဉ်</th>
                <th className="py-3 px-3 border-r border-slate-800">ကုန်ပစ္စည်းကုဒ်</th>
                <th className="py-3 px-4 border-r border-slate-800">ကုန်ပစ္စည်းအမည်</th>
                <th className="py-3 px-3 text-center border-r border-slate-800">ရက်စွဲ</th>
                <th className="py-3 px-3 text-right border-r border-slate-800">အရေအတွက်</th>
                <th className="py-3 px-3 text-right border-r border-slate-800">ဝယ်ဈေး (၁ ခု)</th>
                <th className="py-3 px-4 text-right border-r border-slate-800">ဆုံးရှုံးမှုတန်ဖိုး</th>
                <th className="py-3 px-4 border-r border-slate-800">အကြောင်းအရင်း / မှတ်ချက်</th>
                <th className="py-3 px-3 text-center border-r border-slate-800">အမျိုးအစား</th>
                <th className="py-3 px-2 text-center">ဖျက်ရန်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredDisplayList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                      <p className="font-semibold text-slate-700">စွန့်ပစ်/သက်တမ်းကုန် ပစ္စည်း မရှိပါ</p>
                      <p className="text-xs text-slate-400">ပစ္စည်းအဝင်မှ Waste စာရင်းသွင်းခြင်း သို့မဟုတ် Expiry Date ကုန်ဆုံးသွားပါက ဤစာရင်းတွင် ပေါ်လာမည်ဖြစ်ပါသည်။</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDisplayList.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.sourceType === 'ManualWaste'
                        ? 'bg-rose-50/25'
                        : 'bg-rose-50/45'
                    }`}
                  >
                    <td className="py-3 px-3 text-center text-slate-500 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 border-r border-slate-200">
                      {item.productCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 border-r border-slate-200">
                      {item.productName}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-3 text-right border-r border-slate-200 font-semibold text-slate-900">
                      {(item.qty ?? 0).toLocaleString()} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right border-r border-slate-200 text-slate-600">
                      {(item.purchasePrice ?? 0).toLocaleString()} ကျပ်
                    </td>
                    <td className="py-3 px-4 text-right border-r border-slate-200 font-bold text-rose-600">
                      {(item.lossAmount ?? 0).toLocaleString()} ကျပ်
                    </td>
                    <td className="py-3 px-4 border-r border-slate-200 text-slate-700">
                      {item.reason}
                    </td>
                    <td className="py-3 px-3 text-center border-r border-slate-200">
                      {item.sourceType === 'ManualWaste' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-md">
                          <UserCheck className="w-3 h-3 text-rose-600" />
                          <span>လူကိုယ်တိုင် Waste</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>သက်တမ်းကုန် ({item.expiryDate})</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {item.sourceType === 'ManualWaste' && onDeleteWaste ? (
                        <button
                          onClick={() => onDeleteWaste(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Waste စာရင်း ဖျက်မည်"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredDisplayList.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-center border-r border-slate-200">
                    စုစုပေါင်း (Total)
                  </td>
                  <td className="py-3 px-3 text-right border-r border-slate-200 text-indigo-700">
                    {filteredDisplayList.reduce((s, b) => s + (b.qty || 0), 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right border-r border-slate-200">-</td>
                  <td className="py-3 px-4 text-right border-r border-slate-200 text-rose-600">
                    {filteredDisplayList.reduce((s, b) => s + b.lossAmount, 0).toLocaleString()} ကျပ်
                  </td>
                  <td colSpan={3} className="py-3 px-4 text-center"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

