import React from 'react';
import {
  ShoppingCart,
  Package,
  ArrowDownCircle,
  BarChart3,
  Boxes,
  Store,
  Settings,
} from 'lucide-react';
import { ShopInfo, TabLabels } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  shopInfo: ShopInfo;
  onOpenShopInfo: () => void;
  tabLabels: TabLabels;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  shopInfo,
  onOpenShopInfo,
  tabLabels,
}) => {
  const tabs = [
    {
      id: 'pos',
      label: tabLabels.pos || '🛒 POS အရောင်း',
      sublabel: 'POS Counter',
      icon: ShoppingCart,
    },
    {
      id: 'products',
      label: tabLabels.products || '📦 ပစ္စည်းမော်ဒယ်ဇယား',
      sublabel: 'Products Master',
      icon: Package,
    },
    {
      id: 'stockin',
      label: tabLabels.stockIn || '📥 ပစ္စည်းအဝင်စာရင်း',
      sublabel: 'Stock-In Entry',
      icon: ArrowDownCircle,
    },
    {
      id: 'inventory',
      label: tabLabels.inventory || '🧊 စတော့ကျန် စာရင်း',
      sublabel: 'Current Stock',
      icon: Boxes,
    },
    {
      id: 'reports',
      label: tabLabels.reports || '📊 အရောင်း အစီရင်ခံစာ',
      sublabel: 'Sales Reports',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: tabLabels.settings || '⚙️ ပြင်ဆင်ရန်',
      sublabel: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40">
      {/* Top Brand Bar (Soft Blue / Indigo Theme) */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            🧊
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>{shopInfo.name}</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {shopInfo.tagline}
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShopInfo}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 border border-indigo-500 transition-colors cursor-pointer shadow-xs"
            title="ဆိုင်အချက်အလက် ပြင်ဆင်ရန်"
          >
            <Store className="w-3.5 h-3.5 text-indigo-100" />
            <span>ဆိုင်အချက်အလက် ပြင်ရန်</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-4 sm:px-6 bg-slate-50/80 backdrop-blur-xs overflow-x-auto">
        <nav className="flex space-x-1 py-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <div className="text-left leading-none">
                  <div>{tab.label}</div>
                  <span
                    className={`text-[10px] block mt-0.5 opacity-80 font-normal ${
                      isActive ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {tab.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
