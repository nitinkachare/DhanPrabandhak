import React from 'react';
import { Plus, ArrowRightLeft, Image as ImageIcon, ReceiptText, Trash2 } from 'lucide-react';
import { Account, Category, CurrencyConfig, Language, Transaction } from '../types';
import { translations } from '../data/translations';
import { CategoryIcon } from './CategoryIcon';

interface DailyViewProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currency: CurrencyConfig;
  language: Language;
  onEditTransaction: (tx: Transaction) => void;
  onAddTransaction: (presetDate?: string) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
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

  // Group transactions by date
  const grouped = React.useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });

    // Sort dates descending
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({
      date,
      items: groups[date].sort((a, b) => (b.time || '').localeCompare(a.time || '')),
    }));
  }, [transactions]);

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);
  const getAccount = (accId: string) => accounts.find((a) => a.id === accId);

  const formatDateLabel = (dateStr: string): { dayNumber: number; dayName: string; monthName: string; fullLabel: string } => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
      return { dayNumber: 1, dayName: '', monthName: '', fullLabel: dateStr };
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);

    const daysMr = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthsMr = ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = language === 'mr' ? daysMr[d.getDay()] : daysEn[d.getDay()];
    const monthName = language === 'mr' ? monthsMr[month] : monthsEn[month];

    return {
      dayNumber: day,
      dayName,
      monthName,
      fullLabel: `${day} ${monthName}, ${dayName}`,
    };
  };

  if (transactions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-rose-50 text-[#d32f2f] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ReceiptText size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          {t.noTransactionsMonth}
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
          {language === 'mr'
            ? 'आपण खर्चाची किंवा जमेची कोणतीही नोंद करू शकता. सर्व नोंदी येथे तारखेनुसार दिसतील.'
            : 'Track your daily expenses, income, or account transfers with double-entry precision.'}
        </p>
        <button
          onClick={() => onAddTransaction()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d32f2f] text-white font-bold text-sm shadow hover:bg-rose-800 transition-colors"
        >
          <Plus size={18} />
          <span>{t.addTransaction}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {grouped.map(({ date, items }) => {
        const { dayNumber, dayName, monthName } = formatDateLabel(date);

        // Calculate day income and expense
        let dayIncome = 0;
        let dayExpense = 0;
        items.forEach((it) => {
          if (it.type === 'income') dayIncome += it.amount;
          if (it.type === 'expense') dayExpense += it.amount;
        });

        return (
          <div
            key={date}
            className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
          >
            {/* Day Header Row */}
            <div className="bg-slate-50 px-3.5 py-2.5 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-800 tabular-nums">
                  {dayNumber}
                </span>
                <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <span>{monthName}</span>
                  <span>·</span>
                  <span>{dayName}</span>
                </div>
              </div>

              {/* Day totals */}
              <div className="flex items-center gap-3 text-xs tabular-nums font-semibold">
                {dayIncome > 0 && (
                  <span className="text-emerald-600">
                    +{currency.symbol}{dayIncome.toLocaleString()}
                  </span>
                )}
                {dayExpense > 0 && (
                  <span className="text-rose-600">
                    -{currency.symbol}{dayExpense.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Day Transactions List */}
            <div className="divide-y divide-slate-100">
              {items.map((tx) => {
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
                    className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors active:bg-slate-100 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                      {isTransfer ? (
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <ArrowRightLeft size={18} />
                        </div>
                      ) : (
                        <CategoryIcon
                          name={cat?.icon || 'Tag'}
                          color={cat?.color || (isIncome ? '#10b981' : '#f43f5e')}
                          size={18}
                        />
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 truncate">
                            {isTransfer
                              ? `${acc?.nameMr && language === 'mr' ? acc.nameMr : acc?.name || 'Account'} → ${toAcc?.nameMr && language === 'mr' ? toAcc.nameMr : toAcc?.name || 'Account'}`
                              : (language === 'mr' && cat?.nameMr ? cat.nameMr : cat?.name || t.other)}
                          </span>

                          {tx.receiptImage && (
                            <span title="Receipt attached" className="text-slate-400">
                              <ImageIcon size={14} />
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                          {!isTransfer && (
                            <span className="text-slate-600 font-medium">
                              {language === 'mr' && acc?.nameMr ? acc.nameMr : acc?.name || ''}
                            </span>
                          )}
                          {tx.note && (
                            <>
                              {!isTransfer && <span>·</span>}
                              <span className="truncate">{tx.note}</span>
                            </>
                          )}
                          {tx.payee && (
                            <>
                              <span>·</span>
                              <span className="text-slate-400 truncate">{tx.payee}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount & Direct Delete button */}
                    <div className="flex items-center gap-2 pl-2 shrink-0">
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
          </div>
        );
      })}
    </div>
  );
};
