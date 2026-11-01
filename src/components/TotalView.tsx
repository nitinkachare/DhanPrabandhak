import React from 'react';
import { Landmark, Wallet, CreditCard, PiggyBank, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { Account, CurrencyConfig, Language, Transaction } from '../types';
import { translations } from '../data/translations';
import { calculateAccountBalances } from '../utils/storage';

interface TotalViewProps {
  accounts: Account[];
  transactions: Transaction[];
  allTransactions: Transaction[];
  currency: CurrencyConfig;
  language: Language;
  privacyMode?: boolean;
}

export const TotalView: React.FC<TotalViewProps> = ({
  accounts,
  transactions,
  allTransactions,
  currency,
  language,
  privacyMode = false,
}) => {
  const t = translations[language];

  // All-time account balances
  const balances = calculateAccountBalances(accounts, allTransactions);

  let totalAssets = 0;
  let totalLiabilities = 0;

  accounts.forEach((acc) => {
    const bal = balances[acc.id] || 0;
    if (acc.type === 'card' && bal < 0) {
      totalLiabilities += Math.abs(bal);
    } else if (bal < 0) {
      totalLiabilities += Math.abs(bal);
    } else {
      totalAssets += bal;
    }
  });

  const netWorth = totalAssets - totalLiabilities;

  // Monthly totals
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'income') monthlyIncome += tx.amount;
    if (tx.type === 'expense') monthlyExpense += tx.amount;
  });

  // All-time totals
  let allTimeIncome = 0;
  let allTimeExpense = 0;
  allTransactions.forEach((tx) => {
    if (tx.type === 'income') allTimeIncome += tx.amount;
    if (tx.type === 'expense') allTimeExpense += tx.amount;
  });

  // Calculate Savings Rate for current month
  const savingsRate = monthlyIncome > 0
    ? Math.max(-100, Math.min(100, Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)))
    : 0;

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <Wallet className="text-emerald-600" size={20} />;
      case 'bank':
        return <Landmark className="text-blue-600" size={20} />;
      case 'card':
        return <CreditCard className="text-orange-600" size={20} />;
      default:
        return <PiggyBank className="text-purple-600" size={20} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Net Worth Hero Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {language === 'mr' ? 'एकूण संपत्ती व शिल्लक (Net Worth)' : 'Total Net Worth & Balance'}
        </div>
        <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
          {privacyMode ? '₹••••••' : `${currency.symbol}${netWorth.toLocaleString()}`}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-500">{language === 'mr' ? 'एकूण मालमत्ता (Assets)' : 'Total Assets'}</div>
            <div className="text-base font-bold text-emerald-600 tabular-nums">
              {privacyMode ? '₹••••••' : `+${currency.symbol}${totalAssets.toLocaleString()}`}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">{language === 'mr' ? 'एकूण देणी / कर्ज (Liabilities)' : 'Liabilities / Debts'}</div>
            <div className="text-base font-bold text-rose-600 tabular-nums">
              {privacyMode ? '₹••••••' : `-${currency.symbol}${totalLiabilities.toLocaleString()}`}
            </div>
          </div>
        </div>
      </div>

      {/* Savings Rate & Financial Health Score Card (New Free Feature) */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
              <Sparkles size={16} />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              {t.savingsRate} (This Month)
            </h4>
          </div>
          <span
            className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
              savingsRate >= 30
                ? 'bg-emerald-100 text-emerald-800'
                : savingsRate > 0
                ? 'bg-teal-100 text-teal-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {savingsRate >= 30
              ? language === 'mr' ? 'उत्कृष्ट बचत (Excellent)' : 'Excellent (>30%)'
              : savingsRate > 0
              ? language === 'mr' ? 'चांगली बचत (Good)' : 'Good (>0%)'
              : language === 'mr' ? 'खर्च जास्त आहे (Deficit)' : 'Deficit'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-black text-slate-900 tabular-nums">
            {savingsRate}%
          </span>
          <span className="text-xs text-slate-600">
            {language === 'mr'
              ? 'उत्पन्नाच्या तुलनेत वाचलेली रक्कम'
              : 'of your monthly income saved'}
          </span>
        </div>

        {/* Progress track */}
        <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              savingsRate >= 30 ? 'bg-emerald-500' : savingsRate > 0 ? 'bg-teal-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.max(5, Math.min(100, Math.max(0, savingsRate)))}%` }}
          />
        </div>
      </div>

      {/* Account Balances List */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
          {language === 'mr' ? 'खात्यानुसार शिल्लक' : 'Balances by Account'}
        </div>

        <div className="divide-y divide-slate-100">
          {accounts.map((acc) => {
            const bal = balances[acc.id] || 0;
            return (
              <div key={acc.id} className="p-3 sm:px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      {language === 'mr' && acc.nameMr ? acc.nameMr : acc.name}
                    </div>
                    <div className="text-xs text-slate-400 capitalize">
                      {acc.type}
                    </div>
                  </div>
                </div>

                <div className={`text-sm sm:text-base font-bold tabular-nums ${bal >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                  {privacyMode
                    ? '₹••••••'
                    : `${bal >= 0 ? '' : '-'}${currency.symbol}${Math.abs(bal).toLocaleString()}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly vs All-Time Statistics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-500 mb-2">
            {language === 'mr' ? 'या महिन्यातील व्यवहार' : 'This Month Summary'}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-emerald-500" />
                {t.totalIncome}
              </span>
              <span className="font-bold text-emerald-600 tabular-nums">
                {privacyMode ? '₹••••••' : `+${currency.symbol}${monthlyIncome.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-1.5">
                <TrendingDown size={16} className="text-rose-500" />
                {t.totalExpense}
              </span>
              <span className="font-bold text-rose-600 tabular-nums">
                {privacyMode ? '₹••••••' : `-${currency.symbol}${monthlyExpense.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-500 mb-2">
            {language === 'mr' ? 'आजवरचा एकूण इतिहास' : 'All-Time Records'}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-emerald-500" />
                {t.totalIncome}
              </span>
              <span className="font-bold text-emerald-600 tabular-nums">
                {privacyMode ? '₹••••••' : `+${currency.symbol}${allTimeIncome.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-1.5">
                <TrendingDown size={16} className="text-rose-500" />
                {t.totalExpense}
              </span>
              <span className="font-bold text-rose-600 tabular-nums">
                {privacyMode ? '₹••••••' : `-${currency.symbol}${allTimeExpense.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
