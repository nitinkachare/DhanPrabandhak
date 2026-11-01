import React from 'react';
import { CurrencyConfig, Language, Transaction } from '../types';
import { translations } from '../data/translations';

interface MonthlyViewProps {
  currentDate: Date;
  allTransactions: Transaction[];
  currency: CurrencyConfig;
  language: Language;
  onSelectMonth: (year: number, month: number) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate,
  allTransactions,
  currency,
  language,
  onSelectMonth,
}) => {
  const t = translations[language];
  const currentYear = currentDate.getFullYear();

  const monthNamesMr = [
    'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Aggregate monthly data for current year
  const monthsData = Array.from({ length: 12 }).map((_, mIdx) => {
    const monthStr = String(mIdx + 1).padStart(2, '0');
    const prefix = `${currentYear}-${monthStr}`;

    let income = 0;
    let expense = 0;
    let count = 0;

    allTransactions.forEach((tx) => {
      if (tx.date.startsWith(prefix)) {
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense') expense += tx.amount;
        count++;
      }
    });

    return {
      monthIndex: mIdx,
      name: language === 'mr' ? monthNamesMr[mIdx] : monthNamesEn[mIdx],
      income,
      expense,
      net: income - expense,
      count,
      isCurrent: currentDate.getMonth() === mIdx,
    };
  });

  const maxVal = Math.max(
    ...monthsData.map((m) => Math.max(m.income, m.expense)),
    1000
  );

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            {language === 'mr' ? `${currentYear} चे मासिक विश्लेषण` : `Monthly Analysis - ${currentYear}`}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {language === 'mr' ? 'महिना निवडण्यासाठी क्लिक करा' : 'Click row to view month'}
          </span>
        </div>

        <div className="space-y-3">
          {monthsData.map((m) => {
            const incPct = Math.round((m.income / maxVal) * 100);
            const expPct = Math.round((m.expense / maxVal) * 100);

            return (
              <div
                key={m.monthIndex}
                onClick={() => onSelectMonth(currentYear, m.monthIndex)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  m.isCurrent
                    ? 'border-[#d32f2f] bg-rose-50/20 shadow-xs'
                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">
                      {m.name}
                    </span>
                    {m.isCurrent && (
                      <span className="text-[10px] font-bold bg-[#d32f2f] text-white px-2 py-0.5 rounded-full">
                        {t.thisMonth}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs tabular-nums font-semibold">
                    <span className="text-emerald-600">
                      +{currency.symbol}{m.income.toLocaleString()}
                    </span>
                    <span className="text-rose-600">
                      -{currency.symbol}{m.expense.toLocaleString()}
                    </span>
                    <span className={`font-bold ${m.net >= 0 ? 'text-slate-800' : 'text-rose-700'}`}>
                      = {m.net >= 0 ? '+' : ''}{currency.symbol}{m.net.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Double Bar Visualizer */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${incPct}%` }}
                    />
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-300"
                      style={{ width: `${expPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
