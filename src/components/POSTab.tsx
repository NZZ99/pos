import React, { useState } from 'react';
import { Product, StockInRecord, SaleRecord, SaleItem } from '../types';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Tag,
  CreditCard,
  User,
  Search,
  Printer,
  Sparkles,
} from 'lucide-react';

interface POSTabProps {
  products: Product[];
  stockInList: StockInRecord[];
  onCompleteSale: (sale: SaleRecord) => void;
  onOpenVoucher: (sale: SaleRecord) => void;
}

interface CartItem extends SaleItem {
  id: string; // unique cart row id
}

export const POSTab: React.FC<POSTabProps> = ({
  products,
  stockInList,
  onCompleteSale,
  onOpenVoucher,
}) => {
  const [saleType, setSaleType] = useState<'Retail' | 'Wholesale'>('Retail');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Customer & Payment state
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'KPay' | 'Wave' | 'Credit'>('Cash');
  const [discount, setDiscount] = useState<number | ''>('');
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Cart items state
  const [cart, setCart] = useState<CartItem[]>([]);

  const categories = ['All', 'ကြက်သား', 'ဆတ်သား/အမဲသား', 'ဝက်သား', 'ပင်လယ်စာ', 'ငါး / ပင်လယ်စာ'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const defaultBatch =
      stockInList.find((s) => s.productCode === product.code)?.batchId || 'DEFAULT';
    const price = saleType === 'Wholesale' ? product.wholesalePrice : product.retailPrice;

    // Check if item already exists in cart with same batch and saleType
    const existingIndex = cart.findIndex((i) => i.productCode === product.code);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      const existing = updatedCart[existingIndex];
      const newWeight = existing.weightKg + 1;
      updatedCart[existingIndex] = {
        ...existing,
        weightKg: newWeight,
        totalAmount: newWeight * existing.pricePerKg,
      };
      setCart(updatedCart);
    } else {
      const newCartItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productCode: product.code,
        productName: product.name,
        batchId: defaultBatch,
        weightKg: 1,
        pricePerKg: price,
        totalAmount: price,
        saleType,
      };
      setCart([...cart, newCartItem]);
    }
  };

  const updateCartWeight = (cartId: string, weightKg: number) => {
    if (weightKg <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartId) {
          return {
            ...item,
            weightKg,
            totalAmount: weightKg * item.pricePerKg,
          };
        }
        return item;
      })
    );
  };

  const updateCartPrice = (cartId: string, pricePerKg: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartId) {
          return {
            ...item,
            pricePerKg,
            totalAmount: item.weightKg * pricePerKg,
          };
        }
        return item;
      })
    );
  };

  const updateCartBatch = (cartId: string, batchId: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === cartId ? { ...item, batchId } : item))
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartId));
  };

  // Switch sale type globally and update cart prices if requested
  const handleToggleSaleType = (type: 'Retail' | 'Wholesale') => {
    setSaleType(type);
    setCart((prev) =>
      prev.map((item) => {
        const prod = products.find((p) => p.code === item.productCode);
        if (!prod) return item;
        const newPrice = type === 'Wholesale' ? prod.wholesalePrice : prod.retailPrice;
        return {
          ...item,
          saleType: type,
          pricePerKg: newPrice,
          totalAmount: item.weightKg * newPrice,
        };
      })
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalWeightKg = cart.reduce((sum, item) => sum + item.weightKg, 0);
  const numDiscount = Number(discount) || 0;
  const grandTotal = Math.max(0, subtotal - numDiscount);

  const numCashReceived = Number(cashReceived) || 0;
  const changeAmount = paymentMethod === 'Cash' ? Math.max(0, numCashReceived - grandTotal) : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const nextInvNo = `INV-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newSaleRecord: SaleRecord = {
      id: `sale-${Date.now()}`,
      voucherNo: nextInvNo,
      date: todayStr,
      time: timeStr,
      customerName: customerName.trim() || 'အထွေထွေဝယ်သူ',
      saleType,
      items: cart.map(({ id, ...rest }) => rest),
      totalWeightKg,
      subtotal,
      discount: numDiscount,
      grandTotal,
      paymentMethod,
      cashReceived: paymentMethod === 'Cash' ? numCashReceived || grandTotal : grandTotal,
      changeAmount,
      notes: notes.trim() || undefined,
    };

    onCompleteSale(newSaleRecord);
    onOpenVoucher(newSaleRecord);

    // Reset Form
    setCart([]);
    setCustomerName('');
    setDiscount('');
    setCashReceived('');
    setNotes('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Products Selector (7 cols on lg) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Sale Type Switcher & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">ရောင်းဈေး အမျိုးအစား:</span>
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleToggleSaleType('Retail')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    saleType === 'Retail'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  လက်လီ (Retail)
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSaleType('Wholesale')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    saleType === 'Wholesale'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  လက်ကား (Wholesale)
                </button>
              </div>
            </div>

            <div className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
              {saleType === 'Retail' ? 'လက်လီ ဈေးနှုန်းဖြင့်' : 'လက်ကား ဈေးနှုန်းဖြင့်'}
            </div>
          </div>

          {/* Search & Category pills */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="ကုန်ပစ္စည်း ရှာဖွေရန်..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'အားလုံး' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map((product) => {
            const price = saleType === 'Wholesale' ? product.wholesalePrice : product.retailPrice;
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {product.code}
                    </span>
                    <span className="text-[10px] text-slate-400">{product.category}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {product.name}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {saleType === 'Wholesale' ? 'လက်ကားဈေး' : 'လက်လီဈေး'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-indigo-700">
                      {price.toLocaleString()} ကျပ်
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Checkout Cart & Invoice Form (5 cols on lg) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between border-b pb-3 border-slate-200">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              <span>ဈေးဝယ်ခြင်း စာရင်း (Cart)</span>
            </h3>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
              {cart.length} မျိုး
            </span>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs">ပစ္စည်းများ နှိပ်၍ Cart ထဲသို့ ထည့်ပါ။</p>
              </div>
            ) : (
              cart.map((item) => {
                const productBatches = stockInList.filter(
                  (s) => s.productCode === item.productCode
                );
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.productName}</span>
                        <span className="text-[10px] text-slate-400">{item.productCode}</span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Weight & Price inputs */}
                    <div className="grid grid-cols-12 gap-2 items-center pt-1">
                      {/* Weight KG */}
                      <div className="col-span-4 flex items-center gap-1">
                        <label className="text-[10px] text-slate-500">KG:</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={item.weightKg}
                          onChange={(e) =>
                            updateCartWeight(item.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-right focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Price/KG */}
                      <div className="col-span-4 flex items-center gap-1">
                        <label className="text-[10px] text-slate-500">ဈေး:</label>
                        <input
                          type="number"
                          value={item.pricePerKg}
                          onChange={(e) =>
                            updateCartPrice(item.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-right focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Line Total */}
                      <div className="col-span-4 text-right font-bold text-indigo-700">
                        {item.totalAmount.toLocaleString()} ကျပ်
                      </div>
                    </div>

                    {/* Batch Selection */}
                    {productBatches.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-400">Batch:</span>
                        <select
                          value={item.batchId}
                          onChange={(e) => updateCartBatch(item.id, e.target.value)}
                          className="text-[11px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700"
                        >
                          {productBatches.map((b) => (
                            <option key={b.id} value={b.batchId}>
                              {b.batchId} ({b.storageLocation})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Customer & Payment Form */}
          {cart.length > 0 && (
            <div className="pt-3 border-t border-slate-200 space-y-3 text-xs">
              {/* Customer Name */}
              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>ဝယ်သူအမည် (Customer Name)</span>
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ - ဦးမောင်မောင် / ဒေါ်လှလှ (ဆိုင်)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>ငွေရှင်းပုံစံ (Payment Method)</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'Cash', label: 'Cash (ငွေသား)' },
                    { id: 'KPay', label: 'KPay' },
                    { id: 'Wave', label: 'WavePay' },
                    { id: 'Credit', label: 'Credit (အကြွေး)' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-1.5 px-1 rounded-lg font-medium text-[11px] text-center transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    လျှော့ဈေး (Discount)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-right focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {paymentMethod === 'Cash' && (
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">
                      ပေးငွေ (Cash Received)
                    </label>
                    <input
                      type="number"
                      placeholder={grandTotal.toString()}
                      value={cashReceived}
                      onChange={(e) =>
                        setCashReceived(e.target.value ? Number(e.target.value) : '')
                      }
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-right font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Calculation Breakdown */}
              <div className="bg-indigo-50/70 p-3 rounded-xl space-y-1.5 text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">စုစုပေါင်း အလေးချိန်:</span>
                  <span>{totalWeightKg.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ကျသင့်ငွေ:</span>
                  <span>{subtotal.toLocaleString()} ကျပ်</span>
                </div>
                {numDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>လျှော့ဈေး:</span>
                    <span>- {numDiscount.toLocaleString()} ကျပ်</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-indigo-200/60 text-sm font-bold text-slate-900">
                  <span>အသားတင် ကျသင့်ငွေ:</span>
                  <span className="text-indigo-700 text-base">{grandTotal.toLocaleString()} ကျပ်</span>
                </div>
                {paymentMethod === 'Cash' && numCashReceived > 0 && (
                  <div className="flex justify-between text-xs text-indigo-900 pt-1 border-t border-dashed border-indigo-200">
                    <span>ပြန်အမ်းငွေ (Change):</span>
                    <span className="font-bold">{changeAmount.toLocaleString()} ကျပ်</span>
                  </div>
                )}
              </div>

              {/* Checkout & Voucher Print Button */}
              <button
                onClick={handleCheckout}
                id="checkout-voucher-btn"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>ငွေရှင်းပြီး ဘောင်ချာထုတ်မည် (Checkout & Print Voucher)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
