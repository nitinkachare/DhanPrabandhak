import React, { useState } from 'react';
import { PieChart as PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Category, CurrencyConfig, Language, Transaction } from '../types';
import { translations } from '../data/translations';
import { CategoryIcon } from './CategoryIcon';

interface StatsViewProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  language: Language;
  onEditTransaction: (tx: Transaction) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  transactions,
  categories,
  currency,
  language,
  onEditTransaction,
}) => {
  const t = translations[language];
  const [statType, setStatType] = useState<'expense' | 'income'>('expense');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  // Filter transactions by type
  const filteredTxs = transactions.filter((tx) => tx.type === statType);
  const totalAmount = filteredTxs.reduce((sum, tx) => sum + tx.amount, 0);

  // Aggregate by category
  const categoryStats = React.useMemo(() => {
    const map: Record<string, { total: number; transactions: Transaction[] }> = {};

    filteredTxs.forEach((tx) => {
      const catId = tx.categoryId || 'cat_other_exp';
      if (!map[catId]) {
        map[catId] = { total: 0, transactions: [] };
      }
      map[catId].total += tx.amount;
      map[catId].transactions.push(tx);
    });

    const list = Object.keys(map).map((catId) => {
      const cat = categories.find((c) => c.id === catId);
      const total = map[catId].total;
      const percentage = totalAmount > 0 ? (total / totalAmount) * 100 : 0;
      return {
        catId,
        cat,
        total,
        percentage,
        transactions: map[catId].transactions.sort((a, b) => b.date.localeCompare(a.date)),
      };
    });

    return list.sort((a, b) => b.total - a.total);
  }, [filteredTxs, categories, totalAmount]);

  // SVG Donut calculation
  const donutSlices = React.useMemo(() => {
    let accumulatedAngle = 0;
    return categoryStats.map((item) => {
      const angle = (item.percentage / 100) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;
      return {
        ...item,
        startAngle,
        angle,
      };
    });
  }, [categoryStats]);

  // Generate SVG path for a donut slice
  const createDonutSlicePath = (
    centerX: number,
    centerY: number,
    innerRadius: number,
    outerRadius: number,
    startAngleDeg: number,
    angleDeg: number
  ) => {
    // Prevent full 360 circle glitch in SVG arc
    const clampedAngle = Math.min(angleDeg, 359.99);
    const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
    const endRad = (((startAngleDeg + clampedAngle) - 90) * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = clampedAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Type Toggle */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl">
        <button
          onClick={() => {
            setStatType('expense');
            setSelectedCatId(null);
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            statType === 'expense'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingDown size={16} />
          <span>{t.expenseStats}</span>
        </button>

        <button
          onClick={() => {
            setStatType('income');
            setSelectedCatId(null);
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            statType === 'income'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp size={16} />
          <span>{t.incomeStats}</span>
        </button>
      </div>

      {totalAmount === 0 ? (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-12 text-center text-slate-400">
          <PieChartIcon size={40} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">
            {language === 'mr'
              ? 'या महिन्यात कोणतीही माहिती उपलब्ध नाही.'
              : 'No transactions found for this period.'}
          </p>
        </div>
      ) : (
        <>
          {/* Donut Chart Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col items-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg width="224" height="224" viewBox="0 0 200 200" className="transform rotate-0">
                {donutSlices.map((slice) => {
                  const isSelected = selectedCatId === slice.catId;
                  const sliceColor = slice.cat?.color || '#94a3b8';
                  const path = createDonutSlicePath(
                    100,
                    100,
                    60,
                    isSelected ? 94 : 88,
                    slice.startAngle,
                    slice.angle
                  );

                  return (
                    <path
                      key={slice.catId}
                      d={path}
                      fill={sliceColor}
                      className="cursor-pointer transition-all duration-200 hover:opacity-90"
                      onClick={() =>
                        setSelectedCatId(selectedCatId === slice.catId ? null : slice.catId)
                      }
                    >
                      <title>{`${slice.cat?.name}: ${slice.percentage.toFixed(1)}%`}</title>
                    </path>
                  );
                })}
              </svg>

              {/* Center Total Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  {statType === 'expense' ? t.totalExpense : t.totalIncome}
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums truncate max-w-[140px]">
                  {currency.symbol}{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              {language === 'mr'
                ? 'तपशील पाहण्यासाठी आलेखावर किंवा खालील यादीवर क्लिक करा'
                : 'Tap any slice or row below to view category transactions'}
            </p>
          </div>

          {/* Ranked Category List */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
              {t.topExpenses}
            </div>

            <div className="divide-y divide-slate-100">
              {categoryStats.map((item, index) => {
                const isSelected = selectedCatId === item.catId;
                const catName = language === 'mr' && item.cat?.nameMr ? item.cat.nameMr : item.cat?.name || t.other;
                const catColor = item.cat?.color || '#64748b';

                return (
                  <div key={item.catId} className="transition-colors">
                    <div
                      onClick={() => setSelectedCatId(isSelected ? null : item.catId)}
                      className={`p-3 sm:px-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 ${
                        isSelected ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-slate-400 w-4 text-center">
                          {index + 1}
                        </span>
                        <CategoryIcon
                          name={item.cat?.icon || 'Tag'}
                          color={catColor}
                          size={16}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">
                            {catName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.transactions.length} {language === 'mr' ? 'नोंदी' : 'records'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right pl-3">
                        <div className="text-sm font-bold text-slate-900 tabular-nums">
                          {currency.symbol}{item.total.toLocaleString()}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 tabular-nums">
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Progress track */}
                    <div className="px-4 pb-2">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: catColor,
                          }}
                        />
                      </div>
                    </div>

                    {/* Expanded Transactions for this Category */}
                    {isSelected && (
                      <div className="bg-slate-50/80 border-t border-slate-100 divide-y divide-slate-100/80 px-4 py-2">
                        <div className="text-xs font-bold text-slate-600 mb-1">
                          {catName} - {language === 'mr' ? 'सर्व नोंदी' : 'All Transactions'}:
                        </div>
                        {item.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            onClick={() => onEditTransaction(tx)}
                            className="py-2 flex items-center justify-between text-xs hover:text-slate-900 cursor-pointer"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-700">{tx.date}</span>
                              {tx.note && <span className="text-slate-500 ml-2 truncate">· {tx.note}</span>}
                            </div>
                            <span className="font-bold tabular-nums text-slate-800">
                              {currency.symbol}{tx.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
