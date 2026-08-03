import React, { useState, useEffect } from 'react';
import {
  initialProducts,
  initialStockIn,
  initialSales,
  initialShopInfo,
} from './data/initialData';
import { Product, StockInRecord, SaleRecord, ShopInfo, TabLabels } from './types';
import { Navbar } from './components/Navbar';
import { POSTab } from './components/POSTab';
import { ProductsTab } from './components/ProductsTab';
import { StockInTab } from './components/StockInTab';
import { ReportsTab } from './components/ReportsTab';
import { InventoryTab } from './components/InventoryTab';
import { SettingsTab } from './components/SettingsTab';
import { VoucherModal } from './components/VoucherModal';
import { exportPOSToExcel } from './utils/excelExporter';

const DEFAULT_TAB_LABELS: TabLabels = {
  pos: '🛒 POS အရောင်း',
  products: '📦 ပစ္စည်းမော်ဒယ်ဇယား',
  stockIn: '📥 ပစ္စည်းအဝင်စာရင်း',
  inventory: '🧊 စတော့ကျန် စာရင်း',
  reports: '📊 အရောင်း အစီရင်ခံစာ',
  settings: '⚙️ ပြင်ဆင်ရန်',
};

export default function App() {
  // Persistence via localStorage
  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => {
    const saved = localStorage.getItem('cs_pos_v5_shop');
    return saved ? JSON.parse(saved) : initialShopInfo;
  });

  const [tabLabels, setTabLabels] = useState<TabLabels>(() => {
    const saved = localStorage.getItem('cs_pos_v5_tablabels');
    return saved ? JSON.parse(saved) : DEFAULT_TAB_LABELS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cs_pos_v5_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [stockInList, setStockInList] = useState<StockInRecord[]>(() => {
    const saved = localStorage.getItem('cs_pos_v5_stockin');
    return saved ? JSON.parse(saved) : initialStockIn;
  });

  const [salesList, setSalesList] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('cs_pos_v5_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [activeTab, setActiveTab] = useState<string>('pos');
  const [activeVoucher, setActiveVoucher] = useState<SaleRecord | null>(null);
  const [isShopInfoOpen, setIsShopInfoOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('cs_pos_v5_shop', JSON.stringify(shopInfo));
  }, [shopInfo]);

  useEffect(() => {
    localStorage.setItem('cs_pos_v5_tablabels', JSON.stringify(tabLabels));
  }, [tabLabels]);

  useEffect(() => {
    localStorage.setItem('cs_pos_v5_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cs_pos_v5_stockin', JSON.stringify(stockInList));
  }, [stockInList]);

  useEffect(() => {
    localStorage.setItem('cs_pos_v5_sales', JSON.stringify(salesList));
  }, [salesList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportExcel = () => {
    exportPOSToExcel(products, stockInList, salesList, shopInfo, 'POS_Sales_Report.xlsx');
    showToast('Excel အစီရင်ခံစာ (.xlsx) ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ။');
  };

  // Products handlers
  const handleAddProduct = (newP: Omit<Product, 'id'>) => {
    const p: Product = { ...newP, id: `p-${Date.now()}` };
    setProducts((prev) => [p, ...prev]);
    showToast(`ကုန်ပစ္စည်း (${p.name}) ထည့်သွင်းပြီးပါပြီ။`);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`ကုန်ပစ္စည်း (${updated.name}) ပြင်ဆင်ပြီးပါပြီ။`);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('ဤကုန်ပစ္စည်းကို ဖျက်ရန် သေချာပါသလား?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('ကုန်ပစ္စည်း ဖျက်ပြီးပါပြီ။');
    }
  };

  // Stock In handlers
  const handleAddStockIn = (newStk: Omit<StockInRecord, 'id'>) => {
    const stk: StockInRecord = { ...newStk, id: `stk-${Date.now()}` };
    setStockInList((prev) => [stk, ...prev]);
    showToast(`ပစ္စည်းအဝင် (${stk.productName}) ထည့်သွင်းပြီးပါပြီ။`);
  };

  const handleDeleteStockIn = (id: string) => {
    if (window.confirm('ဤပစ္စည်းအဝင် စာရင်းကို ဖျက်ရန် သေချာပါသလား?')) {
      setStockInList((prev) => prev.filter((s) => s.id !== id));
      showToast('ပစ္စည်းအဝင်စာရင်း ဖျက်ပြီးပါပြီ။');
    }
  };

  // Sales handlers
  const handleCompleteSale = (sale: SaleRecord) => {
    setSalesList((prev) => [sale, ...prev]);
    showToast(`အရောင်းဘောင်ချာ (${sale.voucherNo}) ငွေရှင်းပြီး စာရင်းသွင်းပြီးပါပြီ။`);
  };

  const handleDeleteSale = (id: string) => {
    if (window.confirm('ဤအရောင်းမှတ်တမ်းကို ဖျက်ရန် သေချာပါသလား?')) {
      setSalesList((prev) => prev.filter((s) => s.id !== id));
      showToast('အရောင်းမှတ်တမ်း ဖျက်ပြီးပါပြီ။');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-bounce">
          <span>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shopInfo={shopInfo}
        tabLabels={tabLabels}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'pos' && (
          <POSTab
            products={products}
            stockInList={stockInList}
            onCompleteSale={handleCompleteSale}
            onOpenVoucher={(sale) => setActiveVoucher(sale)}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'stockin' && (
          <StockInTab
            products={products}
            stockInList={stockInList}
            onAddStockIn={handleAddStockIn}
            onDeleteStockIn={handleDeleteStockIn}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            products={products}
            stockInList={stockInList}
            salesList={salesList}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            salesList={salesList}
            onOpenVoucher={(sale) => setActiveVoucher(sale)}
            onDeleteSale={handleDeleteSale}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            shopInfo={shopInfo}
            onSaveShopInfo={(newInfo) => {
              setShopInfo(newInfo);
              showToast('ဆိုင်အချက်အလက်များ သိမ်းဆည်းပြီးပါပြီ။');
            }}
            tabLabels={tabLabels}
            onSaveTabLabels={(newLabels) => {
              setTabLabels(newLabels);
              showToast('Tab အမည်များကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။');
            }}
          />
        )}
      </main>

      {/* Modals */}
      <VoucherModal
        sale={activeVoucher}
        shopInfo={shopInfo}
        onClose={() => setActiveVoucher(null)}
      />
    </div>
  );
}
