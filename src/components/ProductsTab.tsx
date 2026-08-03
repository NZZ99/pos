import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface ProductsTabProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [retailPrice, setRetailPrice] = useState<number | ''>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [category, setCategory] = useState('ကြက်သား');
  const [unit, setUnit] = useState('ထုတ်');

  const categories = ['ကြက်သား', 'ဆတ်သား/အမဲသား', 'ဝက်သား', 'ပင်လယ်စာ', 'ငါး / ပင်လယ်စာ', 'အခြား'];

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    // Auto-generate next code
    const nextNum = products.length + 1;
    const nextCode = `P-${String(nextNum).padStart(3, '0')}`;
    setCode(nextCode);
    setName('');
    setRetailPrice('');
    setWholesalePrice('');
    setMinStock(10);
    setCategory('ကြက်သား');
    setUnit('ထုတ်');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setCode(p.code);
    setName(p.name);
    setRetailPrice(p.retailPrice);
    setWholesalePrice(p.wholesalePrice);
    setMinStock(p.minStock);
    setCategory(p.category || 'ကြက်သား');
    setUnit(p.unit || 'ထုတ်');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !retailPrice || !wholesalePrice) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        code,
        name,
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        minStock: Number(minStock) || 0,
        category,
        unit: unit || 'ထုတ်',
      });
    } else {
      onAddProduct({
        code,
        name,
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        minStock: Number(minStock) || 0,
        category,
        unit: unit || 'ထုတ်',
      });
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>ကုန်ပစ္စည်း မော်ဒယ်/မာစတာ ဇယား</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
              {products.length} Items
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            (Products Master Database) - လက်လီ/လက်ကား ဈေးနှုန်းများနှင့် အနည်းဆုံး စတော့သတိပေးချက်များ ပြင်ဆင်ရန်
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ပစ္စည်းသစ် ထည့်မည်</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="ပစ္စည်းအမည်၊ ကုဒ် (P-001) သို့မဟုတ် အမျိုးအစား ရှာဖွေပါ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
        />
      </div>

      {/* Table replicating user image #1 header style */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Header uses deep soft indigo/blue fill like Image 1 */}
              <tr className="bg-indigo-700 text-white text-xs sm:text-sm font-semibold tracking-wide">
                <th className="py-3.5 px-4 text-center border-r border-indigo-600/50 w-28">
                  ကုန်ပစ္စည်းကုဒ်
                </th>
                <th className="py-3.5 px-6 border-r border-indigo-600/50">
                  ကုန်ပစ္စည်းအမည်
                </th>
                <th className="py-3.5 px-4 text-right border-r border-indigo-600/50 w-40">
                  လက်လီဈေး
                </th>
                <th className="py-3.5 px-4 text-right border-r border-indigo-600/50 w-40">
                  လက်ကားဈေး
                </th>
                <th className="py-3.5 px-4 text-center border-r border-indigo-600/50 w-36">
                  အနည်းဆုံးလက်ကျန်
                </th>
                <th className="py-3.5 px-4 text-center border-r border-indigo-600/50 w-36">
                  အမျိုးအစား
                </th>
                <th className="py-3.5 px-4 text-center w-28">အက်ရှင်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    ရှာဖွေမှုနှင့် ကိုက်ညီသော ကုန်ပစ္စည်း မရှိပါ။
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-indigo-50/40 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-semibold text-slate-900 border-r border-slate-200">
                      {p.code}
                    </td>
                    <td className="py-3 px-6 font-medium text-slate-900 border-r border-slate-200">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-indigo-700 border-r border-slate-200">
                      {(p.retailPrice ?? 0).toLocaleString()} ကျပ်
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800 border-r border-slate-200">
                      {(p.wholesalePrice ?? 0).toLocaleString()} ကျပ်
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-600 border-r border-slate-200">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
                        {p.minStock ?? (p as any).minStockKg ?? 0} {p.unit || 'ခု'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center border-r border-slate-200">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-xs">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="ပြင်ဆင်မည်"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ဖျက်မည်"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 border-slate-200">
              {editingProduct ? 'ပစ္စည်းအချက်အလက် ပြင်ဆင်ရန်' : 'ကုန်ပစ္စည်းသစ် ထည့်သွင်းရန်'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    ကုန်ပစ္စည်းကုဒ် *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="P-001"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    အမျိုးအစား
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  ကုန်ပစ္စည်းအမည် *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="ဥပမာ - ထိုင်းကြက်ရင်ပုံသား"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    လက်လီဈေး *
                  </label>
                  <input
                    type="number"
                    required
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="9000"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    လက်ကားဈေး *
                  </label>
                  <input
                    type="number"
                    required
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="8000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    ရေတွက်ပုံ ရေတွက်နည်း (Unit)
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. ထုတ် / ပွဲ / ခု"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    အနည်းဆုံးလက်ကျန် သတိပေးချက်
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="10"
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
                  {editingProduct ? 'သိမ်းဆည်းမည်' : 'ထည့်သွင်းမည်'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
