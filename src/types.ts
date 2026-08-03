export interface Product {
  id: string;
  code: string; // e.g. P-001
  name: string; // e.g. ထိုင်းကြက်ရင်ပုံသား
  retailPrice: number; // လက်လီဈေး
  wholesalePrice: number; // လက်ကားဈေး
  minStock: number; // အနည်းဆုံးလက်ကျန်
  category: string;
  unit: string; // e.g. ခု, ထုတ်, ပွဲ, ပုံး
}

export interface StockInRecord {
  id: string;
  date: string; // e.g. YYYY-MM-DD
  productCode: string;
  productName: string;
  qty: number; // အရေအတွက်
  purchasePrice: number; // ဝယ်ဈေး (၁ ခု)
  totalCost: number; // စုစုပေါင်း ကျသင့်ငွေ
  expiryDate: string; // Expiry Date
  storageLocation: string; // သိမ်းဆည်းနေရာ
}

export interface SaleItem {
  productCode: string;
  productName: string;
  quantity: number; // အရေအတွက် (Qty)
  unitPrice: number; // ရောင်းဈေး
  totalAmount: number; // အသားတင်ကျသင့်ငွေ
  saleType: 'Retail' | 'Wholesale'; // လက်လီ / လက်ကား
}

export interface SaleRecord {
  id: string;
  voucherNo: string; // e.g. INV-0001
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string; // ဝယ်သူအမည်
  customerPhone?: string;
  saleType: 'Retail' | 'Wholesale'; // အမျိုးအစား
  items: SaleItem[];
  totalQty: number;
  subtotal: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'KPay' | 'Wave' | 'Credit'; // ငွေရှင်းပုံစံ
  cashReceived?: number;
  changeAmount?: number;
  notes?: string;
  status?: 'Completed' | 'Refunded';
  refundReason?: string;
}

export type TimePeriodFilter = 'today' | 'weekly' | 'monthly' | 'custom';

export interface ShopInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  voucherNote: string;
}

export interface TabLabels {
  pos: string;
  products: string;
  stockIn: string;
  inventory: string;
  reports: string;
  settings: string;
}
