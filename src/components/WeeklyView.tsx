import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowRightLeft } from 'lucide-react';
import { Account, Category, CurrencyConfig, Language, Transaction } from '../types';
import { translations } from '../data/translations';
import { CategoryIcon } from './CategoryIcon';

interface WeeklyViewProps {
  currentDate: Date;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currency: CurrencyConfig;
  language: Language;
  onEditTransaction: (tx: Transaction) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  currentDate,
  transactions,
  categories,
  accounts,
  currency,
  language,
  onEditTransaction,
}) => {
  const t = translations[language];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Define week slices
  const weekRanges = [
    { weekNum: 1, start: 1, end: 7 },
    { weekNum: 2, start: 8, end: 14 },
    { weekNum: 3, start: 15, end: 21 },
    { weekNum: 4, start: 22, end: 28 },
    { weekNum: 5, start: 29, end: totalDays },
  ].filter((w) => w.start <= totalDays);

  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });

  const toggleWeek = (num: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);
  const getAccount = (accId: string) => accounts.find((a) => a.id === accId);

  // Group transactions by week
  const weekData = weekRanges.map((range) => {
    const weekTransactions = transactions.filter((tx) => {
      const parts = tx.date.split('-');
      if (parts.length !== 3) return false;
      const txYear = parseInt(parts[0], 10);
      const txMonth = parseInt(parts[1], 10) - 1;
      const txDay = parseInt(parts[2], 10);
      return txYear === year && txMonth === month && txDay >= range.start && txDay <= range.end;
    });

    let income = 0;
    let expense = 0;
    weekTransactions.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      if (tx.type === 'expense') expense += tx.amount;
    });

    return {
      ...range,
      income,
      expense,
      net: income - expense,
      transactions: weekTransactions.sort((a, b) => b.date.localeCompare(a.date)),
    };
  });

  const maxExpense = Math.max(...weekData.map((w) => w.expense), 1);

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Weekly Comparative Overview Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
          <span>{language === 'mr' ? 'साप्ताहिक तुलना व खर्च' : 'Weekly Expense Breakdown'}</span>
        </h3>

        <div className="space-y-3">
          {weekData.map((w) => {
            const expPct = Math.min(100, Math.round((w.expense / maxExpense) * 100));
            return (
              <div key={w.weekNum} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {language === 'mr' ? `आठवडा ${w.weekNum}` : `Week ${w.weekNum}`}{' '}
                    <span className="text-slate-400 font-normal">
                      ({w.start} - {w.end})
                    </span>
                  </span>
                  <div className="flex items-center gap-2 tabular-nums">
                    {w.income > 0 && (
                      <span className="text-emerald-600 font-semibold">
                        +{currency.symbol}{w.income.toLocaleString()}
                      </span>
                    )}
                    <span className="text-rose-600 font-bold">
                      -{currency.symbol}{w.expense.toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Progress track */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${expPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week-by-Week Accordion */}
      <div className="space-y-3">
        {weekData.map((w) => {
          const isExpanded = !!expandedWeeks[w.weekNum];
          return (
            <div
              key={w.weekNum}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => toggleWeek(w.weekNum)}
                className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100/70 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-slate-500" />
                  ) : (
                    <ChevronRight size={18} className="text-slate-500" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800 text-sm">
                      {language === 'mr' ? `आठवडा ${w.weekNum}` : `Week ${w.weekNum}`}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      ({w.start} - {w.end} {language === 'mr' ? 'तारखा' : 'days'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs tabular-nums font-semibold">
                  {w.income > 0 && (
                    <span className="text-emerald-600">
                      +{currency.symbol}{w.income.toLocaleString()}
                    </span>
                  )}
                  <span className="text-rose-600">
                    -{currency.symbol}{w.expense.toLocaleString()}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {w.transactions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      {language === 'mr'
                        ? 'या आठवड्यात कोणतीही नोंद नाही.'
                        : 'No transactions in this week.'}
                    </div>
                  ) : (
                    w.transactions.map((tx) => {
                      const cat = getCategory(tx.categoryId);
                      const acc = getAccount(tx.accountId);
                      const toAcc = tx.toAccountId ? getAccount(tx.toAccountId) : null;
                      const isExpense = tx.type === 'expense';
                      const isIncome = tx.type === 'income';
                      const isTransfer = tx.type === 'transfer';

                      return (
                        <div
                          key={tx.id}
                          onClick={() => onEditTransaction(tx)}
                          className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {isTransfer ? (
                              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <ArrowRightLeft size={16} />
                              </div>
                            ) : (
                              <CategoryIcon
                                name={cat?.icon || 'Tag'}
                                color={cat?.color || (isIncome ? '#10b981' : '#f43f5e')}
                                size={16}
                              />
                            )}

                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-800 truncate">
                                {isTransfer
                                  ? `${acc?.nameMr && language === 'mr' ? acc.nameMr : acc?.name} → ${toAcc?.nameMr && language === 'mr' ? toAcc.nameMr : toAcc?.name}`
                                  : (language === 'mr' && cat?.nameMr ? cat.nameMr : cat?.name || t.other)}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                                <span>{tx.date}</span>
                                {tx.note && (
                                  <>
                                    <span>·</span>
                                    <span className="truncate">{tx.note}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right pl-3">
                            <span
                              className={`text-sm font-bold tabular-nums ${
                                isExpense
                                  ? 'text-rose-600'
                                  : isIncome
                                  ? 'text-emerald-600'
                                  : 'text-indigo-600'
                              }`}
                            >
                              {isExpense && '-'}
                              {isIncome && '+'}
                              {currency.symbol}{tx.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
