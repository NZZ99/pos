export interface Product {
  id: string;
  code: string; // e.g. P-001
  name: string; // e.g. ထိုင်းကြက်ရင်ပုံသား
  retailPrice: number; // လက်လီဈေး (၁-KG)
  wholesalePrice: number; // လက်ကားဈေး (၁-KG)
  minStockKg: number; // အနည်းဆုံးလက်ကျန် (KG)
  category: string;
  unit: string; // e.g. KG
}

export interface StockInRecord {
  id: string;
  date: string; // e.g. YYYY-MM-DD
  batchId: string; // e.g. B-260712-01
  productCode: string;
  productName: string;
  boxCount: number; // သေတ္တာ (Box)
  totalKg: number; // စုစုပေါင်း KG
  purchasePricePerKg: number; // ဝယ်ဈေး (၁-KG)
  totalCost: number; // စုစုပေါင်း ကျသင့်ငွေ
  expiryDate: string; // Expiry Date
  storageLocation: string; // သိမ်းဆည်းနေရာ (e.g. Freezer A-01)
}

export interface SaleItem {
  productCode: string;
  productName: string;
  batchId: string;
  weightKg: number; // အလေးချိန် (KG)
  pricePerKg: number; // ရောင်းဈေး (KG)
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
  totalWeightKg: number;
  subtotal: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'KPay' | 'Wave' | 'Credit'; // ငွေရှင်းပုံစံ (Cash, KPay, Wave, Credit (အကြွေး))
  cashReceived?: number;
  changeAmount?: number;
  notes?: string;
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
