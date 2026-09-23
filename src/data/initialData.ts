import { Product, StockInRecord, SaleRecord, ShopInfo } from '../types';

export const initialShopInfo: ShopInfo = {
  name: "TCO Fresh အအေးခဲ အသားငါး အရောင်းဆိုင်",
  tagline: "လတ်ဆတ်သန့်ရှင်းသော အသားစုံနှင့် စားသောက်ဖွယ်ရာများ",
  address: "အမှတ် (၁၂)၊ ဘိုချုပ်လမ်း၊ တောင်ကြီးမြို့။",
  phone: "09-123456789, 09-987654321",
  voucherNote: "ဝယ်ယူအားပေးမှုကို အထူးကျေးဇူးတင်ရှိပါသည်။ (ဝယ်ယူပြီးပစ္စည်း ပြန်မလဲပါ။)",
  settingsPin: "123456",
};

export const initialProducts: Product[] = [
  {
    id: "p1",
    code: "P-001",
    name: "ထိုင်းကြက်ရင်ပုံသား",
    retailPrice: 9000,
    wholesalePrice: 8000,
    minStock: 10,
    category: "ကြက်သား",
    unit: "ထုတ်",
  },
  {
    id: "p2",
    code: "P-002",
    name: "တရုတ်ဆတ်သားတုံး",
    retailPrice: 14500,
    wholesalePrice: 13500,
    minStock: 5,
    category: "ဆတ်သား/အမဲသား",
    unit: "ထုတ်",
  },
  {
    id: "p3",
    code: "P-003",
    name: "အမဲသားစင်းကော",
    retailPrice: 17000,
    wholesalePrice: 16000,
    minStock: 5,
    category: "ဆတ်သား/အမဲသား",
    unit: "ထုတ်",
  },
];

export const initialStockIn: StockInRecord[] = [];

export const initialSales: SaleRecord[] = [];

