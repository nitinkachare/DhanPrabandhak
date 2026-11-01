import React, { useState } from 'react';
import { Plus, ArrowRightLeft, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Account, Category, CurrencyConfig, Language, Transaction } from '../types';
import { translations } from '../data/translations';
import { CategoryIcon } from './CategoryIcon';

interface CalendarViewProps {
  currentDate: Date;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currency: CurrencyConfig;
  language: Language;
  onEditTransaction: (tx: Transaction) => void;
  onAddTransaction: (presetDate?: string) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  transactions,
  categories,
  accounts,
  currency,
  language,
  onEditTransaction,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const t = translations[language];

  // Currently selected date in calendar (defaults to today or 1st of month)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Aggregate income and expense by day string
  const daySummary = React.useMemo(() => {
    const summary: Record<string, { income: number; expense: number; count: number }> = {};
    transactions.forEach((tx) => {
      if (!summary[tx.date]) {
        summary[tx.date] = { income: 0, expense: 0, count: 0 };
      }
      if (tx.type === 'income') summary[tx.date].income += tx.amount;
      if (tx.type === 'expense') summary[tx.date].expense += tx.amount;
      summary[tx.date].count += 1;
    });
    return summary;
  }, [transactions]);

  const weekHeadersMr = ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  const weekHeadersEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekHeaders = language === 'mr' ? weekHeadersMr : weekHeadersEn;

  // Selected day's transactions
  const selectedDayTransactions = transactions
    .filter((tx) => tx.date === selectedDate)
    .sort((a, b) => (b.time || '').localeCompare(a.time || ''));

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);
  const getAccount = (accId: string) => accounts.find((a) => a.id === accId);

  // Compact formatter for calendar cell (e.g. 1.2k)
  const formatCompact = (num: number) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-2 sm:p-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 mb-2 border-b border-slate-100 pb-2">
          {weekHeaders.map((day, idx) => (
            <div
              key={day}
              className={idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : ''}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[48px] sm:min-h-[68px] bg-slate-50/40 rounded-lg" />
          ))}

          {/* Month days */}
          {Array.from({ length: totalDaysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const stats = daySummary[dateStr] || { income: 0, expense: 0, count: 0 };
            const isSelected = selectedDate === dateStr;
            const isToday = todayStr === dateStr;
            const dayOfWeek = new Date(year, month, dayNum).getDay();

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-[48px] sm:min-h-[68px] p-0.5 sm:p-1 rounded-lg sm:rounded-xl flex flex-col justify-between text-left transition-all relative border active:scale-95 ${
                  isSelected
                    ? 'border-[#d32f2f] bg-rose-50/50 ring-2 ring-[#d32f2f]/30 shadow-xs'
                    : isToday
                    ? 'border-rose-300 bg-white hover:bg-slate-50'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full tabular-nums ${
                      isToday
                        ? 'bg-[#d32f2f] text-white'
                        : dayOfWeek === 0
                        ? 'text-rose-600'
                        : dayOfWeek === 6
                        ? 'text-blue-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {stats.count > 0 && (
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-400" />
                  )}
                </div>

                {/* Day figures */}
                <div className="w-full text-right space-y-0.5 text-[8.5px] sm:text-[11px] font-bold tabular-nums leading-tight overflow-hidden">
                  {stats.income > 0 && (
                    <div className="text-emerald-600 truncate">
                      +{formatCompact(stats.income)}
                    </div>
                  )}
                  {stats.expense > 0 && (
                    <div className="text-rose-600 truncate">
                      -{formatCompact(stats.expense)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base">
              {selectedDate}
            </h4>
            <div className="text-xs text-slate-500 font-medium">
              {selectedDayTransactions.length} {language === 'mr' ? 'नोंदी' : 'records'}
            </div>
          </div>

          <button
            onClick={() => onAddTransaction(selectedDate)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d32f2f] text-white font-bold text-xs hover:bg-rose-800 transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span>{t.addTransaction}</span>
          </button>
        </div>

        {selectedDayTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            {t.noTransactionsDay}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {selectedDayTransactions.map((tx) => {
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
                      <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 truncate">
                          {isTransfer
                            ? `${acc?.nameMr && language === 'mr' ? acc.nameMr : acc?.name} → ${toAcc?.nameMr && language === 'mr' ? toAcc.nameMr : toAcc?.name}`
                            : (language === 'mr' && cat?.nameMr ? cat.nameMr : cat?.name || t.other)}
                        </span>
                        {tx.receiptImage && (
                          <ImageIcon size={14} className="text-slate-400" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {tx.note || (language === 'mr' && acc?.nameMr ? acc.nameMr : acc?.name)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-bold tabular-nums ${
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
                      </div>
                      {tx.time && (
                        <div className="text-[11px] text-slate-400 tabular-nums">
                          {tx.time}
                        </div>
                      )}
                    </div>

                    {onDeleteTransaction && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTransaction(tx.id);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition-all"
                        title={t.delete}
                        aria-label={t.delete}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
