import React, { useState } from 'react';
import { Product, StockInRecord, SaleRecord } from '../types';
import { Boxes, AlertTriangle, CheckCircle2, Search, Clock } from 'lucide-react';

interface InventoryTabProps {
  products: Product[];
  stockInList: StockInRecord[];
  salesList: SaleRecord[];
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  stockInList,
  salesList,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'product' | 'batch'>('product');

  // Compute product level inventory
  const inventoryData = products.map((p) => {
    const totalIn = stockInList
      .filter((s) => s.productCode === p.code)
      .reduce((sum, s) => sum + (s.qty || 0), 0);

    const totalSold = salesList.reduce((sum, sale) => {
      const itemQty = sale.items
        .filter((i) => i.productCode === p.code)
        .reduce((sSum, item) => sSum + (item.quantity || 0), 0);
      return sum + itemQty;
    }, 0);

    const currentStock = totalIn - totalSold;
    const isLow = currentStock <= (p.minStock || 0);

    return {
      product: p,
      totalIn,
      totalSold,
      currentStock,
      isLow,
    };
  });

  const lowStockCount = inventoryData.filter((i) => i.isLow).length;

  // Filtered
  const filteredProducts = inventoryData.filter(
    (i) =>
      i.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>လက်ရှိ အအေးခဲ စတော့ကျန် စာရင်း</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
              Inventory Stock
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            အအေးခန်းထဲတွင် လက်ရှိကျန်ရှိနေသော အသားငါး စတော့ပမာဏနှင့် အနည်းဆုံးသတိပေးချက်များ
          </p>
        </div>
      </div>

      {/* Alert Banner if stock is low */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-800 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold">သတိပြုရန်:</span> ကုန်ပစ္စည်း ({lowStockCount}) မျိုးသည်
              သတ်မှတ်ထားသော အနည်းဆုံး လက်ကျန်ထက် လျော့နည်းနေပါသည်။
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ကုန်ပစ္စည်း ရှာဖွေရန်..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-indigo-700 text-white font-semibold tracking-wide">
                <th className="py-3 px-4 text-center border-r border-indigo-600/50">
                  ကုန်ပစ္စည်းကုဒ်
                </th>
                <th className="py-3 px-6 border-r border-indigo-600/50">ကုန်ပစ္စည်းအမည်</th>
                <th className="py-3 px-4 text-right border-r border-indigo-600/50">
                  အဝင် စုစုပေါင်း
                </th>
                <th className="py-3 px-4 text-right border-r border-indigo-600/50">
                  အရောင်း စုစုပေါင်း
                </th>
                <th className="py-3 px-4 text-right border-r border-indigo-600/50">
                  လက်ရှိစတော့ကျန်
                </th>
                <th className="py-3 px-4 text-center border-r border-indigo-600/50">
                  အနည်းဆုံး သတိပေးချက်
                </th>
                <th className="py-3 px-4 text-center">စတော့အခြေအနေ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredProducts.map((item, idx) => (
                <tr
                  key={item.product.id}
                  className={`hover:bg-indigo-50/40 transition-colors ${
                    item.isLow ? 'bg-amber-50/40' : idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                  }`}
                >
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900 border-r border-slate-200">
                    {item.product.code}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-900 border-r border-slate-200">
                    {item.product.name}
                  </td>
                  <td className="py-3.5 px-4 text-right border-r border-slate-200 text-slate-600">
                    {(item.totalIn ?? 0).toLocaleString()} {item.product.unit || 'ခု'}
                  </td>
                  <td className="py-3.5 px-4 text-right border-r border-slate-200 text-slate-600">
                    {(item.totalSold ?? 0).toLocaleString()} {item.product.unit || 'ခု'}
                  </td>
                  <td className="py-3.5 px-4 text-right border-r border-slate-200 font-bold text-base text-indigo-700">
                    {(item.currentStock ?? 0).toLocaleString()} {item.product.unit || 'ခု'}
                  </td>
                  <td className="py-3.5 px-4 text-center border-r border-slate-200 text-slate-500">
                    {item.product.minStock ?? (item.product as any).minStockKg ?? 0} {item.product.unit || 'ခု'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.isLow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>စတော့နည်းနေသည်</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ပုံမှန်ရှိသည်</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
