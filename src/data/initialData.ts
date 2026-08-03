import { Product, StockInRecord, SaleRecord, ShopInfo } from '../types';

export const initialShopInfo: ShopInfo = {
  name: "အရည်အသွေးမြင့် အအေးခဲ အသားငါး လက်လီ/လက်ကား တောင်ကြီး",
  tagline: "အအေးခဲ အသားငါး အရောင်းဆိုင် (တောင်ကြီးမြို့)",
  address: "အမှတ် (၁၂)၊ ဘိုချုပ်လမ်း၊ တောင်ကြီးမြို့။",
  phone: "09-123456789, 09-987654321",
  voucherNote: "ဝယ်ယူအားပေးမှုကို အထူးကျေးဇူးတင်ရှိပါသည်။ (ဝယ်ယူပြီးပစ္စည်း ပြန်မလဲပါ။)",
};

export const initialProducts: Product[] = [
  {
    id: "p1",
    code: "P-001",
    name: "ထိုင်းကြက်ရင်ပုံသား",
    retailPrice: 9000,
    wholesalePrice: 8000,
    minStockKg: 100,
    category: "ကြက်သား",
    unit: "KG",
  },
  {
    id: "p2",
    code: "P-002",
    name: "တရုတ်ဆတ်သားတုံး",
    retailPrice: 14500,
    wholesalePrice: 13500,
    minStockKg: 50,
    category: "ဆတ်သား/အမဲသား",
    unit: "KG",
  },
  {
    id: "p3",
    code: "P-003",
    name: "အမဲသားစင်းကော",
    retailPrice: 17000,
    wholesalePrice: 16000,
    minStockKg: 30,
    category: "ဆတ်သား/အမဲသား",
    unit: "KG",
  },
];

export const initialStockIn: StockInRecord[] = [
  {
    id: "stk-1",
    date: "2026-07-26",
    batchId: "B-260712-01",
    productCode: "P-001",
    productName: "ထိုင်းကြက်ရင်ပုံသား",
    boxCount: 50,
    totalKg: 500,
    purchasePricePerKg: 7500,
    totalCost: 3750000,
    expiryDate: "2027-01-12",
    storageLocation: "Freezer A-01",
  },
  {
    id: "stk-2",
    date: "2026-07-26",
    batchId: "B-260712-02",
    productCode: "P-002",
    productName: "တရုတ်ဆတ်သားတုံး",
    boxCount: 20,
    totalKg: 400,
    purchasePricePerKg: 12000,
    totalCost: 4800000,
    expiryDate: "2027-07-10",
    storageLocation: "Freezer B-03",
  },
  {
    id: "stk-3",
    date: "2026-07-26",
    batchId: "B-260713-01",
    productCode: "P-003",
    productName: "အမဲသားစင်းကော",
    boxCount: 15,
    totalKg: 150,
    purchasePricePerKg: 15000,
    totalCost: 2250000,
    expiryDate: "2027-01-13",
    storageLocation: "Freezer A-02",
  },
];

export const initialSales: SaleRecord[] = [];
