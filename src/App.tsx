import React, { useState, useEffect } from 'react';
import {
  initialProducts,
  initialStockIn,
  initialSales,
  initialShopInfo,
} from './data/initialData';
import { Product, StockInRecord, SaleRecord, ShopInfo, TabLabels, User } from './types';
import { Navbar } from './components/Navbar';
import { POSTab } from './components/POSTab';
import { ProductsTab } from './components/ProductsTab';
import { StockInTab } from './components/StockInTab';
import { ReportsTab } from './components/ReportsTab';
import { InventoryTab } from './components/InventoryTab';
import { WasteTab } from './components/WasteTab';
import { SettingsTab } from './components/SettingsTab';
import { VoucherModal } from './components/VoucherModal';
import { exportPOSToExcel } from './utils/excelExporter';
import { LoginScreen } from './components/LoginScreen';
import { SecurityPinModal } from './components/SecurityPinModal';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, updateDoc } from 'firebase/firestore';

const DEFAULT_TAB_LABELS: TabLabels = {
  pos: '🛒 POS အရောင်း',
  products: '📦 ပစ္စည်းစာရင်း',
  stockIn: '📥 ပစ္စည်းအဝင်စာရင်း',
  inventory: '🧊 စတော့ကျန် စာရင်း',
  waste: '🗑️ စွန့်ပစ်/သက်တမ်းလွန်',
  reports: '📊 အရောင်း အစီရင်ခံစာ',
  settings: '⚙️ ပြင်ဆင်ရန်',
};

interface MainDashboardProps {
  key?: string;
  currentUser: User;
  onLogout: () => void;
}

function MainDashboard({ currentUser, onLogout }: MainDashboardProps) {
  const suffix = `_${currentUser.email.toLowerCase()}`;
  const encodedEmail = currentUser.email.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

  const [isLoading, setIsLoading] = useState(true);

  // Persistence via localStorage with user suffix
  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => {
    try {
      const saved = localStorage.getItem(`cs_pos_v5_shop${suffix}`);
      return saved ? JSON.parse(saved) : initialShopInfo;
    } catch {
      return initialShopInfo;
    }
  });

  const [tabLabels, setTabLabels] = useState<TabLabels>(() => {
    const saved = localStorage.getItem(`cs_pos_v5_tablabels${suffix}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.products === '📦 ပစ္စည်းမော်ဒယ်ဇယား') {
          parsed.products = '📦 ပစ္စည်းစာရင်း';
        }
        return parsed;
      } catch (e) {
        return DEFAULT_TAB_LABELS;
      }
    }
    return DEFAULT_TAB_LABELS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`cs_pos_v5_products${suffix}`);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [stockInList, setStockInList] = useState<StockInRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`cs_pos_v5_stockin${suffix}`);
      return saved ? JSON.parse(saved) : initialStockIn;
    } catch {
      return initialStockIn;
    }
  });

  const [salesList, setSalesList] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`cs_pos_v5_sales${suffix}`);
      return saved ? JSON.parse(saved) : initialSales;
    } catch {
      return initialSales;
    }
  });

  const [accountPassword, setAccountPassword] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`cs_pos_v5_pw_${suffix}`);
      if (saved) return saved;
      const localUsers = JSON.parse(localStorage.getItem('cs_pos_v5_local_users') || '{}');
      return localUsers[currentUser.email.toLowerCase().trim()] || '';
    } catch {
      return '';
    }
  });

  const [activeTab, setActiveTab] = useState<string>('pos');
  const [activeVoucher, setActiveVoucher] = useState<SaleRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state from Firestore on mount
  useEffect(() => {
    let active = true;
    const fetchFromFirebase = async () => {
      try {
        const userRef = doc(db, 'users', encodedEmail);
        const userSnap = await getDoc(userRef).catch(err => {
          handleFirestoreError(err, OperationType.GET, `users/${encodedEmail}`);
        });

        if (!active) return;

        if (userSnap && userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.password) {
            setAccountPassword(userData.password);
            try {
              localStorage.setItem(`cs_pos_v5_pw_${suffix}`, userData.password);
            } catch {
              // ignore
            }
          }
          if (userData.shopInfo) {
            setShopInfo(userData.shopInfo);
            localStorage.setItem(`cs_pos_v5_shop${suffix}`, JSON.stringify(userData.shopInfo));
          }
          if (userData.tabLabels) {
            const labels = { ...userData.tabLabels };
            if (labels.products === '📦 ပစ္စည်းမော်ဒယ်ဇယား') {
              labels.products = '📦 ပစ္စည်းစာရင်း';
              // Update in Firestore asynchronously so they don't load the old label again
              updateDoc(userRef, { tabLabels: labels }).catch(err => {
                console.error("Failed to update migrated tab labels in Firestore", err);
              });
            }
            setTabLabels(labels);
            localStorage.setItem(`cs_pos_v5_tablabels${suffix}`, JSON.stringify(labels));
          }

          // Fetch products directly from Firestore (single source of truth)
          const prodCol = collection(db, 'users', encodedEmail, 'products');
          const prodSnap = await getDocs(prodCol).catch(err => {
            handleFirestoreError(err, OperationType.LIST, `users/${encodedEmail}/products`);
          });
          if (prodSnap && active) {
            const list: Product[] = [];
            prodSnap.forEach(d => list.push(d.data() as Product));
            setProducts(list);
            localStorage.setItem(`cs_pos_v5_products${suffix}`, JSON.stringify(list));
          }

          // Fetch stockInList directly from Firestore
          const stockCol = collection(db, 'users', encodedEmail, 'stockIn');
          const stockSnap = await getDocs(stockCol).catch(err => {
            handleFirestoreError(err, OperationType.LIST, `users/${encodedEmail}/stockIn`);
          });
          if (stockSnap && active) {
            const list: StockInRecord[] = [];
            stockSnap.forEach(d => list.push(d.data() as StockInRecord));
            list.sort((a, b) => b.id.localeCompare(a.id));
            setStockInList(list);
            localStorage.setItem(`cs_pos_v5_stockin${suffix}`, JSON.stringify(list));
          }

          // Fetch salesList directly from Firestore
          const salesCol = collection(db, 'users', encodedEmail, 'sales');
          const salesSnap = await getDocs(salesCol).catch(err => {
            handleFirestoreError(err, OperationType.LIST, `users/${encodedEmail}/sales`);
          });
          if (salesSnap && active) {
            const list: SaleRecord[] = [];
            salesSnap.forEach(d => list.push(d.data() as SaleRecord));
            list.sort((a, b) => b.id.localeCompare(a.id));
            setSalesList(list);
            localStorage.setItem(`cs_pos_v5_sales${suffix}`, JSON.stringify(list));
          }
        } else {
          // If user does not exist in Firebase, upload existing/initial state as first-time setup
          await setDoc(userRef, sanitizeForFirestore({
            email: currentUser.email,
            fullName: currentUser.fullName || '',
            avatarUrl: currentUser.avatarUrl || '',
            shopInfo: shopInfo,
            tabLabels: tabLabels,
          })).catch(err => {
            handleFirestoreError(err, OperationType.CREATE, `users/${encodedEmail}`);
          });

          // Upload products
          for (const p of products) {
            await setDoc(doc(db, 'users', encodedEmail, 'products', p.id), sanitizeForFirestore(p)).catch(err => {
              handleFirestoreError(err, OperationType.CREATE, `users/${encodedEmail}/products/${p.id}`);
            });
          }

          // Upload stock records
          for (const s of stockInList) {
            await setDoc(doc(db, 'users', encodedEmail, 'stockIn', s.id), sanitizeForFirestore(s)).catch(err => {
              handleFirestoreError(err, OperationType.CREATE, `users/${encodedEmail}/stockIn/${s.id}`);
            });
          }

          // Upload sale records
          for (const s of salesList) {
            await setDoc(doc(db, 'users', encodedEmail, 'sales', s.id), sanitizeForFirestore(s)).catch(err => {
              handleFirestoreError(err, OperationType.CREATE, `users/${encodedEmail}/sales/${s.id}`);
            });
          }
        }
      } catch (err) {
        console.error('Firebase rehydration failed:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchFromFirebase();
    return () => {
      active = false;
    };
  }, [encodedEmail, suffix, currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportExcel = () => {
    exportPOSToExcel(products, stockInList, salesList, shopInfo, 'POS_Sales_Report.xlsx');
    showToast('Excel အစီရင်ခံစာ (.xlsx) ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ။');
  };

  // Products handlers
  const handleAddProduct = async (newP: Omit<Product, 'id'>) => {
    const p: Product = { ...newP, id: `p-${Date.now()}` };
    const nextProds = [p, ...products];
    setProducts(nextProds);
    localStorage.setItem(`cs_pos_v5_products${suffix}`, JSON.stringify(nextProds));
    try {
      await setDoc(doc(db, 'users', encodedEmail, 'products', p.id), sanitizeForFirestore(p)).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `users/${encodedEmail}/products/${p.id}`);
      });
      showToast(`ကုန်ပစ္စည်း (${p.name}) ထည့်သွင်းပြီးပါပြီ။`);
    } catch (err) {
      console.error(err);
    }
  };

  // PIN / Password Authentication state for sensitive actions (data delete)
  const [pinModalConfig, setPinModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType?: 'delete' | 'confirm';
    onSuccess: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'delete',
    onSuccess: () => {},
  });

  const requestPinAuth = (
    title: string,
    description: string,
    onSuccess: () => void,
    actionType: 'delete' | 'confirm' = 'delete'
  ) => {
    setPinModalConfig({
      isOpen: true,
      title,
      description,
      actionType,
      onSuccess: () => {
        setPinModalConfig((prev) => ({ ...prev, isOpen: false }));
        onSuccess();
      },
    });
  };

  const handleUpdateProduct = async (updated: Product) => {
    const nextProds = products.map((p) => (p.id === updated.id ? updated : p));
    setProducts(nextProds);
    localStorage.setItem(`cs_pos_v5_products${suffix}`, JSON.stringify(nextProds));
    try {
      await setDoc(doc(db, 'users', encodedEmail, 'products', updated.id), sanitizeForFirestore(updated)).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `users/${encodedEmail}/products/${updated.id}`);
      });
      showToast(`ကုန်ပစ္စည်း (${updated.name}) ပြင်ဆင်ပြီးပါပြီ။`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    const prodName = prod ? ` (${prod.name}) ` : ' ';
    requestPinAuth(
      'ကုန်ပစ္စည်း ဖျက်ရန် အတည်ပြုပါ',
      `ကုန်ပစ္စည်း${prodName}ကို စနစ်ထဲမှ လုံးဝဖျက်ပစ်ရန် သင့် Login Password သို့မဟုတ် Security PIN ကို ထည့်သွင်းအတည်ပြုပေးပါ။`,
      async () => {
        const nextProds = products.filter((p) => p.id !== id);
        setProducts(nextProds);
        localStorage.setItem(`cs_pos_v5_products${suffix}`, JSON.stringify(nextProds));
        try {
          await deleteDoc(doc(db, 'users', encodedEmail, 'products', id)).catch(err => {
            handleFirestoreError(err, OperationType.DELETE, `users/${encodedEmail}/products/${id}`);
          });
          showToast('ကုန်ပစ္စည်း ဖျက်ပြီးပါပြီ။');
        } catch (err) {
          console.error(err);
        }
      },
      'delete'
    );
  };

  // Stock In handlers
  const handleAddStockIn = async (newStk: Omit<StockInRecord, 'id'>) => {
    const stk: StockInRecord = { ...newStk, id: `stk-${Date.now()}` };
    const nextStock = [stk, ...stockInList];
    setStockInList(nextStock);
    localStorage.setItem(`cs_pos_v5_stockin${suffix}`, JSON.stringify(nextStock));
    try {
      await setDoc(doc(db, 'users', encodedEmail, 'stockIn', stk.id), sanitizeForFirestore(stk)).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `users/${encodedEmail}/stockIn/${stk.id}`);
      });
      showToast(`ပစ္စည်းအဝင် (${stk.productName}) ထည့်သွင်းပြီးပါပြီ။`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStockIn = async (id: string) => {
    const stk = stockInList.find((s) => s.id === id);
    const stkName = stk ? ` (${stk.productName}) ` : ' ';
    requestPinAuth(
      'ပစ္စည်းအဝင် စာရင်းဖျက်ရန် အတည်ပြုပါ',
      `ပစ္စည်းအဝင် စာရင်း${stkName}ကို စနစ်ထဲမှ လုံးဝဖျက်ရန် သင့် Login Password သို့မဟုတ် Security PIN ကို ထည့်သွင်းအတည်ပြုပေးပါ။`,
      async () => {
        const nextStock = stockInList.filter((s) => s.id !== id);
        setStockInList(nextStock);
        localStorage.setItem(`cs_pos_v5_stockin${suffix}`, JSON.stringify(nextStock));
        try {
          await deleteDoc(doc(db, 'users', encodedEmail, 'stockIn', id)).catch(err => {
            handleFirestoreError(err, OperationType.DELETE, `users/${encodedEmail}/stockIn/${id}`);
          });
          showToast('ပစ္စည်းအဝင်စာရင်း ဖျက်ပြီးပါပြီ။');
        } catch (err) {
          console.error(err);
        }
      },
      'delete'
    );
  };

  // Sales handlers
  const handleCompleteSale = async (sale: SaleRecord) => {
    const nextSales = [sale, ...salesList];
    setSalesList(nextSales);
    localStorage.setItem(`cs_pos_v5_sales${suffix}`, JSON.stringify(nextSales));
    try {
      await setDoc(doc(db, 'users', encodedEmail, 'sales', sale.id), sanitizeForFirestore(sale)).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `users/${encodedEmail}/sales/${sale.id}`);
      });
      showToast(`အရောင်းဘောင်ချာ (${sale.voucherNo}) ငွေရှင်းပြီး စာရင်းသွင်းပြီးပါပြီ။`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSale = async (id: string) => {
    const sale = salesList.find((s) => s.id === id);
    const vNo = sale ? ` (ဘောင်ချာ ${sale.voucherNo}) ` : ' ';
    requestPinAuth(
      'အရောင်းမှတ်တမ်း ဖျက်ရန် အတည်ပြုပါ',
      `အရောင်းမှတ်တမ်း${vNo}ကို စနစ်ထဲမှ လုံးဝဖျက်ရန် သင့် Login Password သို့မဟုတ် Security PIN ကို ထည့်သွင်းအတည်ပြုပေးပါ။`,
      async () => {
        const nextSales = salesList.filter((s) => s.id !== id);
        setSalesList(nextSales);
        localStorage.setItem(`cs_pos_v5_sales${suffix}`, JSON.stringify(nextSales));
        try {
          await deleteDoc(doc(db, 'users', encodedEmail, 'sales', id)).catch(err => {
            handleFirestoreError(err, OperationType.DELETE, `users/${encodedEmail}/sales/${id}`);
          });
          showToast('အရောင်းမှတ်တမ်း ဖျက်ပြီးပါပြီ။');
        } catch (err) {
          console.error(err);
        }
      },
      'delete'
    );
  };

  const handleRefundSale = async (id: string, reason?: string) => {
    const sale = salesList.find((s) => s.id === id);
    const vNo = sale ? ` (ဘောင်ချာ ${sale.voucherNo}) ` : ' ';
    requestPinAuth(
      'အရောင်းဘောင်ချာ ပယ်ဖျက်/Refund ရန် အတည်ပြုပါ',
      `အရောင်းဘောင်ချာ${vNo}ကို ပယ်ဖျက်/Refund ပြုလုပ်ရန် သင့် Login Password သို့မဟုတ် Security PIN ကို ထည့်သွင်းအတည်ပြုပေးပါ။`,
      async () => {
        const defReason = reason || 'မှားယွင်းရောင်းချမှု ပယ်ဖျက်ခြင်း/Refund ပြုလုပ်ခြင်း';
        const nextSales = salesList.map((s) => {
          if (s.id === id) {
            return {
              ...s,
              status: 'Refunded' as const,
              refundReason: defReason,
            };
          }
          return s;
        });
        setSalesList(nextSales);
        localStorage.setItem(`cs_pos_v5_sales${suffix}`, JSON.stringify(nextSales));
        try {
          await updateDoc(doc(db, 'users', encodedEmail, 'sales', id), {
            status: 'Refunded',
            refundReason: defReason,
          }).catch(err => {
            handleFirestoreError(err, OperationType.UPDATE, `users/${encodedEmail}/sales/${id}`);
          });
          showToast('အရောင်းဘောင်ချာကို Refund ပြုလုပ်ပြီး စတော့ပြန်လည်ဖြည့်သွင်းလိုက်ပါပြီ။');
        } catch (err) {
          console.error(err);
        }
      },
      'delete'
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center space-y-3">
            <div className="flex justify-center">
              <svg className="w-8 h-8 text-emerald-600 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-700 animate-pulse">Loading...</p>
          </div>
        </div>
      )}

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
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'pos' && (
          <POSTab
            products={products}
            stockInList={stockInList}
            salesList={salesList}
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
            onRequestPinAuth={requestPinAuth}
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

        {activeTab === 'waste' && (
          <WasteTab
            products={products}
            stockInList={stockInList}
            shopInfo={shopInfo}
            onDeleteStockIn={handleDeleteStockIn}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            salesList={salesList}
            products={products}
            stockInList={stockInList}
            shopInfo={shopInfo}
            accountPassword={accountPassword}
            onOpenVoucher={(sale) => setActiveVoucher(sale)}
            onDeleteSale={handleDeleteSale}
            onRefundSale={handleRefundSale}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            shopInfo={shopInfo}
            onSaveShopInfo={async (newInfo) => {
              setShopInfo(newInfo);
              localStorage.setItem(`cs_pos_v5_shop${suffix}`, JSON.stringify(newInfo));
              try {
                await setDoc(doc(db, 'users', encodedEmail), sanitizeForFirestore({ shopInfo: newInfo }), { merge: true }).catch(err => {
                  handleFirestoreError(err, OperationType.WRITE, `users/${encodedEmail}`);
                });
                showToast('ဆိုင်အချက်အလက်များ သိမ်းဆည်းပြီးပါပြီ။');
              } catch (err) {
                console.error(err);
              }
            }}
            tabLabels={tabLabels}
            onSaveTabLabels={async (newLabels) => {
              setTabLabels(newLabels);
              localStorage.setItem(`cs_pos_v5_tablabels${suffix}`, JSON.stringify(newLabels));
              try {
                await setDoc(doc(db, 'users', encodedEmail), sanitizeForFirestore({ tabLabels: newLabels }), { merge: true }).catch(err => {
                  handleFirestoreError(err, OperationType.WRITE, `users/${encodedEmail}`);
                });
                showToast('Tab အမည်များကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။');
              } catch (err) {
                console.error(err);
              }
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

      <SecurityPinModal
        isOpen={pinModalConfig.isOpen}
        correctPin={shopInfo.settingsPin || '123456'}
        accountPassword={accountPassword}
        title={pinModalConfig.title}
        description={pinModalConfig.description}
        actionType={pinModalConfig.actionType || 'delete'}
        onSuccess={pinModalConfig.onSuccess}
        onClose={() => setPinModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cs_pos_v5_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cs_pos_v5_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cs_pos_v5_current_user');
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('စနစ်မှ ထွက်လိုက်ပါပြီ။');
  };

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-bounce">
          <span>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}
      <MainDashboard
        key={currentUser.email}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </>
  );
}

