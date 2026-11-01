import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { CurrencyConfig, Language, ViewTab } from '../types';
import { translations } from '../data/translations';

interface HeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  totalIncome: number;
  totalExpense: number;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  language: Language;
  currency: CurrencyConfig;
  onOpenSearch: () => void;
  onOpenBackup: () => void;
  onOpenAddModal: () => void;
  currentUser?: User | null;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  totalIncome,
  totalExpense,
  activeTab,
  onTabChange,
  language,
  currency,
  onOpenSearch,
  onOpenBackup,
  onOpenAddModal,
  currentUser,
  isSyncing,
}) => {
  const t = translations[language];
  const netTotal = totalIncome - totalExpense;

  const monthNames = {
    mr: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
    gu: ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'],
    ta: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
    te: ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'],
    kn: ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'],
    bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  };

  const currentMonthList = monthNames[language] || monthNames.en;
  const currentMonthName = `${currentMonthList[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const tabs: { key: ViewTab; label: string }[] = [
    { key: 'daily', label: t.tabDaily },
    { key: 'calendar', label: t.tabCalendar },
    { key: 'debts', label: t.tabDebts },
    { key: 'weekly', label: t.tabWeekly },
    { key: 'monthly', label: t.tabMonthly },
    { key: 'total', label: t.tabTotal },
    { key: 'stats', label: t.tabStats },
    { key: 'accounts', label: t.tabAccounts },
  ];

  return (
    <header className="bg-gradient-to-b from-[#d32f2f] to-[#b71c1c] text-white shadow-md select-none sticky top-0 z-30 pt-[env(safe-area-inset-top,0px)]">
      {/* Top Bar: Name, 100% Free, Search on left, and Firebase Login on right */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-2.5 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center font-black text-white text-base shadow-inner shrink-0">
            ₹
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <h1 className="font-extrabold text-base sm:text-xl tracking-tight leading-none whitespace-nowrap">
              {t.appName}
            </h1>
            <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase shrink-0">
              100% Free
            </span>
          </div>
        </div>

        {/* Right Action Controls: Search on right */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenSearch}
            title={t.search}
            aria-label={t.search}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center text-white shadow-sm"
          >
            <Search size={18} />
          </button>

          <button
            onClick={onOpenAddModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#d32f2f] font-bold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={16} strokeWidth={3} />
            <span>{t.addTransaction}</span>
          </button>
        </div>
      </div>

      {/* Month Navigation & Summary */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5">
        <div className="flex items-center justify-between border-b border-white/15 pb-2">
          <div className="flex items-center gap-0.5">
            <button
              onClick={onPrevMonth}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/15 active:bg-white/25 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="font-bold text-sm sm:text-base min-w-[125px] sm:min-w-[140px] text-center tracking-tight">
              {currentMonthName}
            </span>
            <button
              onClick={onNextMonth}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/15 active:bg-white/25 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          <button
            onClick={onToday}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all uppercase tracking-wider"
          >
            {t.today}
          </button>
        </div>

        {/* Financial Monthly Overview Bar */}
        <div className="grid grid-cols-3 divide-x divide-white/15 pt-2 text-center">
          <div className="px-1">
            <div className="text-[11px] text-white/75 font-medium uppercase tracking-wider">
              {t.income}
            </div>
            <div className="text-xs sm:text-sm font-bold text-emerald-300 truncate mt-0.5">
              +{currency.symbol}
              {totalIncome.toLocaleString()}
            </div>
          </div>
          <div className="px-1">
            <div className="text-[11px] text-white/75 font-medium uppercase tracking-wider">
              {t.expense}
            </div>
            <div className="text-xs sm:text-sm font-bold text-rose-200 truncate mt-0.5">
              -{currency.symbol}
              {totalExpense.toLocaleString()}
            </div>
          </div>
          <div className="px-1">
            <div className="text-[11px] text-white/75 font-medium uppercase tracking-wider">
              {t.balance}
            </div>
            <div
              className={`text-xs sm:text-sm font-extrabold truncate mt-0.5 ${
                netTotal >= 0 ? 'text-white' : 'text-amber-300'
              }`}
            >
              {currency.symbol}
              {netTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-1 sm:px-4 flex items-center overflow-x-auto no-scrollbar border-t border-white/10 text-xs font-semibold">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`py-2 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-all uppercase tracking-wider text-[11px] ${
                isActive
                  ? 'border-white text-white font-extrabold bg-white/10'
                  : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
