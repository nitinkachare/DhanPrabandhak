import React from 'react';
import {
  ListTodo,
  Calendar,
  PieChart,
  Wallet,
  Settings,
  Plus,
} from 'lucide-react';
import { Language, ViewTab } from '../types';
import { translations } from '../data/translations';

interface BottomNavProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  language: Language;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
  onOpenAddModal,
  onOpenSettings,
}) => {
  const t = translations[language];

  const navItems: { tab: ViewTab; label: string; icon: React.ReactNode; isAction?: boolean }[] = [
    { tab: 'daily', label: t.tabDaily, icon: <ListTodo size={22} /> },
    { tab: 'calendar', label: t.tabCalendar, icon: <Calendar size={22} /> },
    { tab: 'stats', label: t.tabStats, icon: <PieChart size={22} /> },
    { tab: 'accounts', label: t.tabAccounts, icon: <Wallet size={22} /> },
    { tab: 'settings', label: t.tabSettings, icon: <Settings size={22} />, isAction: true },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) for instant transaction entry */}
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-8 z-30">
        <button
          onClick={onOpenAddModal}
          className="w-14 h-14 rounded-full bg-[#d32f2f] hover:bg-rose-800 active:scale-90 text-white shadow-xl shadow-rose-900/30 flex items-center justify-center transition-all group focus:outline-hidden ring-4 ring-white/80"
          title={t.addTransaction}
          aria-label={t.addTransaction}
        >
          <Plus size={30} strokeWidth={2.8} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Fixed Bottom Thumb Bar (Optimized for Mobile Ergonomics & Safe Area) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg sm:hidden pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] select-none">
        <div className="grid grid-cols-5 h-16 items-center">
          {navItems.map((item) => {
            const isActive = !item.isAction && activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  if (item.isAction) {
                    onOpenSettings();
                  } else {
                    onTabChange(item.tab);
                  }
                }}
                className={`flex flex-col items-center justify-center h-full active:scale-95 transition-transform ${
                  isActive
                    ? 'text-[#d32f2f]'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-rose-50 text-[#d32f2f]' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[62px] ${
                  isActive ? 'font-extrabold text-[#d32f2f]' : 'font-medium text-slate-500'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
