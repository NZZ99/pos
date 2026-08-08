import React, { useState } from 'react';
import {
  ShoppingCart,
  Package,
  ArrowDownCircle,
  BarChart3,
  Boxes,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { ShopInfo, TabLabels, User } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  shopInfo: ShopInfo;
  tabLabels: TabLabels;
  currentUser: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  shopInfo,
  tabLabels,
  currentUser,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    {
      id: 'pos',
      label: tabLabels.pos || '🛒 POS အရောင်း',
      sublabel: 'POS Counter',
      icon: ShoppingCart,
    },
    {
      id: 'products',
      label: tabLabels.products || '📦 ပစ္စည်းစာရင်း',
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
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-sm sticky top-0 z-40">
      {/* Top Header Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left Side: Hamburger Menu Button + Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 transition-colors cursor-pointer flex items-center justify-center"
            title="စာမျက်နှာများ ရွေးချယ်ရန် (Menu)"
          >
            {isMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-inner">
              🧊
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                {shopInfo.name}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {shopInfo.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Active Tab Indicator + User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
            <span className="text-slate-400">လက်ရှိ စာမျက်နှာ:</span>
            <span className="font-bold text-indigo-300">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl shadow-xs">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.email}
                  className="w-5 h-5 rounded-full shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold uppercase">
                  {currentUser.email[0]}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-100 max-w-[100px] truncate leading-none">
                  {currentUser.fullName || currentUser.email.split('@')[0]}
                </span>
                <span className="text-[9px] text-slate-400 max-w-[100px] truncate leading-none mt-0.5">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer ml-1"
                title="စနစ်မှ ထွက်မည် (Log out)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vertical Navigation Slide-out Drawer / Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Vertical Menu Sidebar Drawer */}
          <aside className="fixed top-0 left-0 bottom-0 w-72 bg-slate-900 text-white z-50 border-r border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  🧊
                </div>
                <span className="font-bold text-sm text-white">Menu Navigation</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shop Info Summary inside Drawer */}
            <div className="p-4 bg-slate-800/50 border-b border-slate-800 space-y-3">
              <div>
                <h2 className="text-xs font-bold text-indigo-300">{shopInfo.name}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{shopInfo.address}</p>
              </div>

              {currentUser && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.email}
                        className="w-6 h-6 rounded-full shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold uppercase">
                        {currentUser.email[0]}
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-bold text-slate-200 truncate max-w-[120px]">
                        {currentUser.fullName || currentUser.email.split('@')[0]}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate max-w-[120px]">
                        {currentUser.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="စနစ်မှ ထွက်မည်"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Vertical Tab Links */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{tab.label}</div>
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

            {/* Drawer Footer */}
          </aside>
        </>
      )}
    </header>
  );
};
