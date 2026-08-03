import React, { useState } from 'react';
import { Product, StockInRecord } from '../types';
import { Plus, Search, Trash2 } from 'lucide-react';

interface StockInTabProps {
  products: Product[];
  stockInList: StockInRecord[];
  onAddStockIn: (stk: Omit<StockInRecord, 'id'>) => void;
  onDeleteStockIn: (id: string) => void;
}

export const StockInTab: React.FC<StockInTabProps> = ({
  products,
  stockInList,
  onAddStockIn,
  onDeleteStockIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [batchId, setBatchId] = useState('');
  const [selectedProductCode, setSelectedProductCode] = useState('');
  const [boxCount, setBoxCount] = useState<number | ''>('');
  const [totalKg, setTotalKg] = useState<number | ''>('');
  const [purchasePricePerKg, setPurchasePricePerKg] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [storageLocation, setStorageLocation] = useState('Freezer A-01');

  const handleOpenModal = () => {
    const activeProduct = products[0];
    if (activeProduct) {
      setSelectedProductCode(activeProduct.code);
    }
    setDate(today);

    // Auto batch ID format: B-YYMMDD-XX
    const dateFormatted = today.replace(/-/g, '').slice(2);
    const existingBatchesToday = stockInList.filter((s) => s.batchId.includes(dateFormatted));
    const batchSeq = String(existingBatchesToday.length + 1).padStart(2, '0');
    setBatchId(`B-${dateFormatted}-${batchSeq}`);

    setBoxCount(10);
    setTotalKg(100);
    setPurchasePricePerKg(8000);

    // Default expiry 6 months from today
    const exp = new Date();
    exp.setMonth(exp.getMonth() + 6);
    setExpiryDate(exp.toISOString().split('T')[0]);

    setStorageLocation('Freezer A-01');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductCode || !batchId || !totalKg || !purchasePricePerKg) return;

    const matchedProduct = products.find((p) => p.code === selectedProductCode);
    const pName = matchedProduct ? matchedProduct.name : 'Unknown Product';
    const numTotalKg = Number(totalKg);
    const numPrice = Number(purchasePricePerKg);
    const totalCost = numTotalKg * numPrice;

    onAddStockIn({
      date,
      batchId,
      productCode: selectedProductCode,
      productName: pName,
      boxCount: Number(boxCount) || 0,
      totalKg: numTotalKg,
      purchasePricePerKg: numPrice,
      totalCost,
      expiryDate,
      storageLocation,
    });

    setIsModalOpen(false);
  };

  const filteredList = stockInList.filter(
    (stk) =>
      stk.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stk.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stk.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stk.storageLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBoxes = filteredList.reduce((sum, s) => sum + s.boxCount, 0);
  const totalWeightKg = filteredList.reduce((sum, s) => sum + s.totalKg, 0);
  const totalCostSum = filteredList.reduce((sum, s) => sum + s.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>ပစ္စည်းအဝင်စာရင်း ဇယား</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
              Stock-In Entry Sheet
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ဂိုဒေါင်/အအေးခန်းသို့ သေတ္တာအလိုက် ပစ္စည်းအဝင်စာရင်းများနှင့် ဝယ်ဈေး၊ Expiry Date များ ထည့်သွင်းရန်
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>အဝင်သစ် ထည့်မည်</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Batch ID၊ ပစ္စည်းအမည် သို့မဟုတ် သိမ်းဆည်းနေရာ ရှာရန်..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
        />
      </div>

      {/* Table replicating Image 2 Section 1 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-indigo-700 text-white font-semibold tracking-wide">
                <th className="py-3 px-3 text-center border-r border-indigo-600/50">ရက်စွဲ</th>
                <th className="py-3 px-3 text-center border-r border-indigo-600/50">Batch ID</th>
                <th className="py-3 px-3 text-center border-r border-indigo-600/50">ပစ္စည်းကုဒ်</th>
                <th className="py-3 px-4 border-r border-indigo-600/50">ပစ္စည်းအမည်</th>
                <th className="py-3 px-3 text-right border-r border-indigo-600/50">သေတ္တာ (Box)</th>
                <th className="py-3 px-3 text-right border-r border-indigo-600/50">စုစုပေါင်း KG</th>
                <th className="py-3 px-3 text-right border-r border-indigo-600/50">ဝယ်ဈေး (၁-KG)</th>
                <th className="py-3 px-4 text-right border-r border-indigo-600/50">စုစုပေါင်းကျသင့်ငွေ</th>
                <th className="py-3 px-3 text-center border-r border-indigo-600/50">Expiry Date</th>
                <th className="py-3 px-3 text-center border-r border-indigo-600/50">သိမ်းဆည်းနေရာ</th>
                <th className="py-3 px-3 text-center">ဖျက်ရန်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    ပစ္စည်းအဝင် စာရင်းမရှိသေးပါ။
                  </td>
                </tr>
              ) : (
                filteredList.map((stk, idx) => (
                  <tr
                    key={stk.id}
                    className={`hover:bg-indigo-50/40 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-3 text-center border-r border-slate-200 text-slate-600 font-medium">
                      {stk.date}
                    </td>
                    <td className="py-3 px-3 text-center border-r border-slate-200 font-semibold text-indigo-700">
                      {stk.batchId}
                    </td>
                    <td className="py-3 px-3 text-center border-r border-slate-200 font-medium text-slate-800">
                      {stk.productCode}
                    </td>
                    <td className="py-3 px-4 border-r border-slate-200 font-medium text-slate-900">
                      {stk.productName}
                    </td>
                    <td className="py-3 px-3 text-right border-r border-slate-200 font-medium">
                      {stk.boxCount}
                    </td>
                    <td className="py-3 px-3 text-right border-r border-slate-200 font-semibold text-slate-900">
                      {stk.totalKg.toLocaleString()} KG
                    </td>
                    <td className="py-3 px-3 text-right border-r border-slate-200">
                      {stk.purchasePricePerKg.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right border-r border-slate-200 font-semibold text-indigo-700">
                      {stk.totalCost.toLocaleString()} ကျပ်
                    </td>
                    <td className="py-3 px-3 text-center border-r border-slate-200 text-slate-600 text-xs">
                      {stk.expiryDate}
                    </td>
                    <td className="py-3 px-3 text-center border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                        {stk.storageLocation}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onDeleteStockIn(stk.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="ဖျက်မည်"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer Total Summary Row */}
            <tfoot className="bg-indigo-50/80 font-bold text-slate-900 border-t-2 border-indigo-200 text-xs sm:text-sm">
              <tr>
                <td colSpan={4} className="py-3 px-4 border-r border-slate-200 text-right">
                  Total (စုစုပေါင်း):
                </td>
                <td className="py-3 px-3 text-right border-r border-slate-200">{totalBoxes} Box</td>
                <td className="py-3 px-3 text-right border-r border-slate-200 text-indigo-800">
                  {totalWeightKg.toLocaleString()} KG
                </td>
                <td className="py-3 px-3 text-center border-r border-slate-200">-</td>
                <td className="py-3 px-4 text-right border-r border-slate-200 text-indigo-800">
                  {totalCostSum.toLocaleString()} ကျပ်
                </td>
                <td colSpan={3} className="py-3 px-3 text-center"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add StockIn Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 border-slate-200">
              ပစ္စည်းအဝင်စာရင်းသစ် ထည့်သွင်းရန်
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ရက်စွဲ *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Batch ID *</label>
                  <input
                    type="text"
                    required
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="B-260712-01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  ကုန်ပစ္စည်း ရွေးချယ်ပါ *
                </label>
                <select
                  value={selectedProductCode}
                  onChange={(e) => setSelectedProductCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">သေတ္တာ အရေအတွက် (Box)</label>
                  <input
                    type="number"
                    value={boxCount}
                    onChange={(e) => setBoxCount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">စုစုပေါင်း KG *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={totalKg}
                    onChange={(e) => setTotalKg(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    ဝယ်ဈေး (၁-KG) *
                  </label>
                  <input
                    type="number"
                    required
                    value={purchasePricePerKg}
                    onChange={(e) => setPurchasePricePerKg(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="7500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    စုစုပေါင်း ကျသင့်ငွေ (ကျပ်)
                  </label>
                  <div className="px-3 py-2 bg-slate-100 font-bold text-indigo-700 rounded-lg border border-slate-200">
                    {((Number(totalKg) || 0) * (Number(purchasePricePerKg) || 0)).toLocaleString()} ကျပ်
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">သိမ်းဆည်းနေရာ</label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="Freezer A-01"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-xs cursor-pointer"
                >
                  ထည့်သွင်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
