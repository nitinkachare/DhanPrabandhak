import React, { useState } from 'react';
import {
  X,
  Trash2,
  Check,
  Calendar,
  Clock,
  Wallet,
  Camera,
  ArrowRightLeft,
  Plus,
  Tag,
} from 'lucide-react';
import { Account, Category, CurrencyConfig, Language, Transaction, TransactionType } from '../types';
import { translations } from '../data/translations';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  editingTransaction?: Transaction | null;
  accounts: Account[];
  categories: Category[];
  currency: CurrencyConfig;
  language: Language;
  presetDate?: string;
  presetAccountId?: string;
  presetType?: TransactionType;
  onAddCustomCategory: (cat: Category) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingTransaction,
  accounts,
  categories,
  currency,
  language,
  presetDate,
  presetAccountId,
  presetType,
  onAddCustomCategory,
}) => {
  const t = translations[language];

  const now = new Date();
  const defaultDate = presetDate || now.toISOString().split('T')[0];
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [type, setType] = useState<TransactionType>(
    editingTransaction?.type || presetType || 'expense'
  );
  const [amountStr, setAmountStr] = useState<string>(
    editingTransaction ? editingTransaction.amount.toString() : ''
  );
  const [date, setDate] = useState<string>(editingTransaction?.date || defaultDate);
  const [time, setTime] = useState<string>(editingTransaction?.time || defaultTime);
  const [accountId, setAccountId] = useState<string>(
    editingTransaction?.accountId || presetAccountId || (accounts[0]?.id || '')
  );
  const [toAccountId, setToAccountId] = useState<string>(
    editingTransaction?.toAccountId || (accounts[1]?.id || '')
  );
  const [categoryId, setCategoryId] = useState<string>(
    editingTransaction?.categoryId || (categories.find((c) => c.type === (presetType || 'expense'))?.id || '')
  );
  const [note, setNote] = useState<string>(editingTransaction?.note || '');
  const [payee, setPayee] = useState<string>(editingTransaction?.payee || '');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(
    editingTransaction?.receiptImage
  );

  const [confirmDeletePrompt, setConfirmDeletePrompt] = useState(false);
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameMr, setNewCatNameMr] = useState('');

  if (!isOpen) return null;

  const availableCategories = categories.filter((c) => c.type === (type === 'transfer' ? 'expense' : type));

  const addQuickAmount = (val: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + val).toString());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      nameMr: newCatNameMr.trim() || newCatName.trim(),
      type: type === 'income' ? 'income' : 'expense',
      icon: 'Tag',
      color: type === 'income' ? '#10b981' : '#f43f5e',
    };
    onAddCustomCategory(newCat);
    setCategoryId(newCat.id);
    setIsAddingNewCat(false);
    setNewCatName('');
    setNewCatNameMr('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const tx: Transaction = {
      id: editingTransaction?.id || `tx_${Date.now()}`,
      type,
      amount: parsedAmount,
      date,
      time,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categoryId: type === 'transfer' ? '' : categoryId,
      note: note.trim(),
      payee: payee.trim(),
      receiptImage,
      createdAt: editingTransaction?.createdAt || Date.now(),
    };

    onSave(tx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Native-feel Mobile Bottom Sheet Container */}
      <div className="bg-white w-full sm:max-w-lg rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom duration-200">
        
        {/* Mobile Grab / Drag Handle */}
        <div className="sm:hidden w-full pt-3 pb-1 flex justify-center bg-slate-900">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        {/* Top Type Selector Header: Expense | Income | Transfer */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex bg-slate-800 p-1 rounded-xl w-full max-w-xs">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (type !== 'expense') {
                  const firstExp = categories.find((c) => c.type === 'expense');
                  if (firstExp) setCategoryId(firstExp.id);
                }
              }}
              className={`flex-1 min-h-[38px] py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (type !== 'income') {
                  const firstInc = categories.find((c) => c.type === 'income');
                  if (firstInc) setCategoryId(firstInc.id);
                }
              }}
              className={`flex-1 min-h-[38px] py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.income}
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex-1 min-h-[38px] py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === 'transfer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.transfer}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Amount Input with Numeric Dialpad Keypad inputMode */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              {t.amount}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl sm:text-3xl font-extrabold text-slate-400 select-none">
                {currency.symbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 text-2xl sm:text-3xl font-extrabold rounded-2xl border-2 tabular-nums focus:outline-hidden transition-all ${
                  type === 'expense'
                    ? 'border-rose-200 focus:border-rose-600 text-rose-600'
                    : type === 'income'
                    ? 'border-emerald-200 focus:border-emerald-600 text-emerald-600'
                    : 'border-indigo-200 focus:border-indigo-600 text-indigo-600'
                }`}
              />
            </div>

            {/* Quick addition chips (finger-friendly) */}
            <div className="flex gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
              {[100, 500, 1000, 2000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addQuickAmount(val)}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 whitespace-nowrap transition-all"
                >
                  +{currency.symbol}{val}
                </button>
              ))}
              <button
                key="clear"
                type="button"
                onClick={() => setAmountStr('')}
                className="min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 whitespace-nowrap transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar size={14} />
                <span>{t.selectDate}</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Clock size={14} />
                <span>वेळ (Time)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
              />
            </div>
          </div>

          {/* Account Selection */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-2 gap-2.5 p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">
                  {t.fromAccount}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full min-h-[44px] px-2.5 py-2 border border-indigo-200 rounded-xl text-xs sm:text-sm bg-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {language === 'mr' && a.nameMr ? a.nameMr : a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">
                  {t.toAccount}
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full min-h-[44px] px-2.5 py-2 border border-indigo-200 rounded-xl text-xs sm:text-sm bg-white"
                >
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {language === 'mr' && a.nameMr ? a.nameMr : a.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <Wallet size={14} />
                <span>{t.selectAccount}</span>
              </label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {accounts.map((a) => {
                  const isSelected = accountId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAccountId(a.id)}
                      className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border active:scale-95 ${
                        isSelected
                          ? 'border-[#d32f2f] bg-rose-50 text-[#d32f2f] shadow-xs ring-1 ring-[#d32f2f]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {language === 'mr' && a.nameMr ? a.nameMr : a.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categories Grid (Only for Expense & Income) */}
          {type !== 'transfer' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-600">
                  {t.selectCategory}
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                  className="text-xs font-bold text-[#d32f2f] hover:underline flex items-center gap-1 min-h-[36px]"
                >
                  <Plus size={14} />
                  <span>{language === 'mr' ? 'नवीन श्रेणी जोडा' : 'Add Custom'}</span>
                </button>
              </div>

              {/* Add custom category popup inline */}
              {isAddingNewCat && (
                <div className="p-3 mb-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="min-h-[40px] px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                    <input
                      type="text"
                      placeholder="श्रेणीचे नाव (मराठीत)"
                      value={newCatNameMr}
                      onChange={(e) => setNewCatNameMr(e.target.value)}
                      className="min-h-[40px] px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(false)}
                      className="min-h-[36px] px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCategory}
                      className="min-h-[36px] px-4 py-1.5 text-xs font-bold bg-[#d32f2f] text-white rounded-xl shadow-xs"
                    >
                      Save Category
                    </button>
                  </div>
                </div>
              )}

              {/* Touch-Optimized Category Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-100 rounded-2xl">
                {availableCategories.map((c) => {
                  const isSelected = categoryId === c.id;
                  const catName = language === 'mr' && c.nameMr ? c.nameMr : c.name;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={`min-h-[64px] p-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all border active:scale-95 ${
                        isSelected
                          ? 'border-[#d32f2f] bg-rose-50/60 shadow-xs ring-1.5 ring-[#d32f2f]'
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <CategoryIcon name={c.icon} color={c.color} size={18} />
                      <span className="text-[10px] font-bold text-slate-700 mt-1 line-clamp-1">
                        {catName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t.note}
            </label>
            <input
              type="text"
              placeholder={language === 'mr' ? 'उदा. भाजीपाला, चहा नाश्ता, वीज बिल...' : 'e.g. Groceries, Dinner, Fuel...'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
            />
          </div>

          {/* Payee / Place */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t.payee}
            </label>
            <input
              type="text"
              placeholder={language === 'mr' ? 'उदा. डी-मार्ट, हॉटेल, मित्र...' : 'e.g. Store name, Merchant, Person...'}
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
            />
          </div>

          {/* Photo / Receipt Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Camera size={14} />
              <span>{t.receiptPhoto}</span>
            </label>

            {receiptImage ? (
              <div className="relative inline-block mt-1">
                <img
                  src={receiptImage}
                  alt="Receipt"
                  className="w-24 h-24 object-cover rounded-2xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setReceiptImage(undefined)}
                  className="absolute -top-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-md hover:bg-rose-700"
                  title={t.removePhoto}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 min-h-[44px] px-3.5 py-2.5 border border-dashed border-slate-300 rounded-xl text-xs text-slate-600 hover:bg-slate-50 cursor-pointer active:bg-slate-100">
                <Camera size={18} className="text-slate-500" />
                <span className="font-medium">
                  {language === 'mr' ? 'कॅमेऱ्याने फोटो काढा किंवा फाईल निवडा' : 'Take photo or upload file'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Mobile Bottom Sticky Confirmation Strip */}
          <div className="pt-3 pb-safe border-t border-slate-100 sticky bottom-0 bg-white">
            {confirmDeletePrompt ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-2 rounded-xl">
                <span className="text-xs font-bold text-rose-800 flex-1 pl-1">
                  {language === 'mr' ? 'खरोखर हटवायचे आहे का?' : 'Delete this transaction?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (editingTransaction && onDelete) {
                      onDelete(editingTransaction.id);
                    }
                    setConfirmDeletePrompt(false);
                    onClose();
                  }}
                  className="min-h-[40px] px-3.5 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 active:scale-95 transition-all shadow-xs flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  <span>{t.delete}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeletePrompt(false)}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl active:scale-95 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {editingTransaction && onDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeletePrompt(true)}
                    className="w-12 h-12 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center shrink-0 active:scale-95 transition-colors"
                    title={t.delete}
                    aria-label={t.delete}
                  >
                    <Trash2 size={20} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setConfirmDeletePrompt(false);
                    onClose();
                  }}
                  className="flex-1 h-12 text-sm font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  className="flex-1 h-12 text-sm font-bold rounded-xl bg-[#d32f2f] text-white hover:bg-rose-800 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Check size={20} strokeWidth={3} />
                  <span>{t.save}</span>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
