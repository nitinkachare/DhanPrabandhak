import React, { useState } from 'react';
import { Plus, AlertTriangle, CheckCircle2, Sliders, Edit3, Trash2 } from 'lucide-react';
import { Budget, Category, CurrencyConfig, Language, Transaction } from '../types';
import { translations } from '../data/translations';
import { CategoryIcon } from './CategoryIcon';

interface BudgetViewProps {
  currentDate: Date;
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  currency: CurrencyConfig;
  language: Language;
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (categoryId: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  currentDate,
  budgets,
  categories,
  transactions,
  currency,
  language,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const t = translations[language];
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [budgetAmount, setBudgetAmount] = useState<number>(5000);

  // Filter expenses only
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Calculate actual spending in current month per category
  const categorySpending = React.useMemo(() => {
    const spending: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        spending[tx.categoryId] = (spending[tx.categoryId] || 0) + tx.amount;
      }
    });
    return spending;
  }, [transactions]);

  const handleOpenAdd = (presetCatId?: string, presetAmt?: number) => {
    setSelectedCatId(presetCatId || (expenseCategories[0]?.id || ''));
    setBudgetAmount(presetAmt || 5000);
    setIsEditingBudget(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || budgetAmount <= 0) return;
    onSaveBudget({ categoryId: selectedCatId, amount: budgetAmount });
    setIsEditingBudget(false);
  };

  // Overall budget total
  let totalBudget = 0;
  let totalSpentOnBudgeted = 0;

  const budgetItems = budgets.map((b) => {
    const cat = categories.find((c) => c.id === b.categoryId);
    const spent = categorySpending[b.categoryId] || 0;
    const remaining = b.amount - spent;
    const pct = Math.min(200, Math.round((spent / b.amount) * 100));
    totalBudget += b.amount;
    totalSpentOnBudgeted += spent;

    return {
      budget: b,
      category: cat,
      spent,
      remaining,
      pct,
      isOver: spent > b.amount,
    };
  });

  const totalOverallPct = totalBudget > 0 ? Math.round((totalSpentOnBudgeted / totalBudget) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Overall Budget Overview Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {t.manageBudget}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'mr' ? 'खर्चावर नियंत्रण ठेवण्यासाठी मासिक मर्यादा निश्चित करा' : 'Set monthly limits to keep expenses controlled'}
            </p>
          </div>

          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d32f2f] text-white font-bold text-xs hover:bg-rose-800 transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span>{t.setBudget}</span>
          </button>
        </div>

        {budgets.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600">
                {language === 'mr' ? 'एकूण बजेट वापर' : 'Overall Budget Used'} ({totalOverallPct}%)
              </span>
              <span className="font-bold tabular-nums text-slate-900">
                {currency.symbol}{totalSpentOnBudgeted.toLocaleString()} / {currency.symbol}{totalBudget.toLocaleString()}
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalOverallPct > 100
                    ? 'bg-rose-600'
                    : totalOverallPct > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, totalOverallPct)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Budgets List */}
      <div className="space-y-3">
        {budgetItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
            <Sliders size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">{t.noBudgetsMsg}</p>
            <button
              onClick={() => handleOpenAdd()}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#d32f2f] text-white rounded-xl text-xs font-bold hover:bg-rose-800"
            >
              <Plus size={16} />
              <span>{t.setBudget}</span>
            </button>
          </div>
        ) : (
          budgetItems.map(({ budget, category, spent, remaining, pct, isOver }) => {
            const catName = language === 'mr' && category?.nameMr ? category.nameMr : category?.name || t.other;
            const barColor = isOver ? 'bg-rose-600' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <div
                key={budget.categoryId}
                className={`bg-white rounded-2xl p-4 shadow-xs border transition-all ${
                  isOver ? 'border-rose-300 bg-rose-50/15' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CategoryIcon
                      name={category?.icon || 'Tag'}
                      color={category?.color || '#f43f5e'}
                      size={18}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {catName}
                      </h4>
                      <div className="text-xs text-slate-400">
                        {t.budgetLimit}: {currency.symbol}{budget.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        {currency.symbol}{spent.toLocaleString()}
                      </div>
                      <div
                        className={`text-xs font-semibold tabular-nums ${
                          isOver ? 'text-rose-600' : 'text-slate-500'
                        }`}
                      >
                        {isOver
                          ? `${t.overBudget} (+${currency.symbol}${Math.abs(remaining).toLocaleString()})`
                          : `${currency.symbol}${remaining.toLocaleString()} ${t.remaining}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAdd(budget.categoryId, budget.amount)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title="Edit budget"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(budget.categoryId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      title="Remove budget"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{pct}% {t.budgetUsed}</span>
                    <span>
                      {isOver ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle size={12} /> मर्यादा ओलांडली
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> बजेटमध्ये आहे
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Set Budget Modal */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#d32f2f] text-white px-5 py-3 font-bold text-base flex justify-between items-center">
              <span>{t.setBudget}</span>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.selectCategory}
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f] bg-white"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'mr' && c.nameMr ? c.nameMr : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.budgetLimit} ({currency.symbol})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f] tabular-nums"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-[#d32f2f] text-white hover:bg-rose-800 transition-colors shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
