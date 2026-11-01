import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Account, Category, FilterOptions, Language, TransactionType } from '../types';
import { translations } from '../data/translations';

interface FilterSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: FilterOptions;
  onChangeFilter: (filters: FilterOptions) => void;
  accounts: Account[];
  categories: Category[];
  language: Language;
}

export const FilterSearchModal: React.FC<FilterSearchModalProps> = ({
  isOpen,
  onClose,
  filterOptions,
  onChangeFilter,
  accounts,
  categories,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const handleReset = () => {
    onChangeFilter({
      searchQuery: '',
      type: 'all',
      accountId: '',
      categoryId: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#d32f2f] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <Filter size={18} />
            <span>{t.filter} / {t.search}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Keyword Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.search}
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={language === 'mr' ? 'उदा. किराणा, हॉटेल, पेट्रोल...' : 'Search note, payee...'}
                value={filterOptions.searchQuery}
                onChange={(e) =>
                  onChangeFilter({ ...filterOptions, searchQuery: e.target.value })
                }
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'प्रकार (Type)' : 'Transaction Type'}
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(['all', 'expense', 'income', 'transfer'] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => onChangeFilter({ ...filterOptions, type: tp })}
                  className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                    filterOptions.type === tp
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tp === 'all'
                    ? t.all
                    : tp === 'expense'
                    ? t.expense
                    : tp === 'income'
                    ? t.income
                    : t.transfer}
                </button>
              ))}
            </div>
          </div>

          {/* Account Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.selectAccount}
            </label>
            <select
              value={filterOptions.accountId}
              onChange={(e) =>
                onChangeFilter({ ...filterOptions, accountId: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-[#d32f2f]"
            >
              <option value="">{t.all} ({language === 'mr' ? 'सर्व खाती' : 'All Accounts'})</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {language === 'mr' && a.nameMr ? a.nameMr : a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.selectCategory}
            </label>
            <select
              value={filterOptions.categoryId}
              onChange={(e) =>
                onChangeFilter({ ...filterOptions, categoryId: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-[#d32f2f]"
            >
              <option value="">{t.all} ({language === 'mr' ? 'सर्व वर्ग' : 'All Categories'})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'mr' && c.nameMr ? c.nameMr : c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {t.clearFilter}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-[#d32f2f] text-white hover:bg-rose-800 transition-colors shadow-xs"
            >
              {language === 'mr' ? 'परिणाम पहा' : 'Apply & View'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
