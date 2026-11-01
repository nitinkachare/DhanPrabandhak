import React, { useState } from 'react';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Trash2,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { CurrencyConfig, DebtRecord, Language } from '../types';
import { translations } from '../data/translations';

interface DebtsViewProps {
  debts: DebtRecord[];
  currency: CurrencyConfig;
  language: Language;
  privacyMode: boolean;
  onSaveDebt: (debt: DebtRecord) => void;
  onDeleteDebt: (id: string) => void;
  onToggleSettled: (id: string) => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({
  debts,
  currency,
  language,
  privacyMode,
  onSaveDebt,
  onDeleteDebt,
  onToggleSettled,
}) => {
  const t = translations[language];

  const [filter, setFilter] = useState<'all' | 'pending' | 'settled'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);
  const [showModalDeleteConfirm, setShowModalDeleteConfirm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Partial<DebtRecord>>({
    type: 'to_receive',
    personName: '',
    amount: 0,
    dueDate: '',
    note: '',
    isSettled: false,
  });

  // Calculate totals for pending debts
  let totalToReceive = 0;
  let totalToPay = 0;

  debts.forEach((d) => {
    if (!d.isSettled) {
      if (d.type === 'to_receive') totalToReceive += d.amount;
      if (d.type === 'to_pay') totalToPay += d.amount;
    }
  });

  const netBalance = totalToReceive - totalToPay;

  const filteredDebts = debts.filter((d) => {
    if (filter === 'pending') return !d.isSettled;
    if (filter === 'settled') return d.isSettled;
    return true;
  });

  const handleOpenAdd = (type: 'to_receive' | 'to_pay' = 'to_receive') => {
    setEditingDebt({
      id: `debt_${Date.now()}`,
      type,
      personName: '',
      amount: 0,
      dueDate: '',
      note: '',
      isSettled: false,
      createdAt: Date.now(),
    });
    setShowModalDeleteConfirm(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (debt: DebtRecord) => {
    setEditingDebt({ ...debt });
    setShowModalDeleteConfirm(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDebt.personName || !editingDebt.amount || editingDebt.amount <= 0) return;

    onSaveDebt({
      id: editingDebt.id || `debt_${Date.now()}`,
      type: editingDebt.type || 'to_receive',
      personName: editingDebt.personName.trim(),
      amount: Number(editingDebt.amount),
      dueDate: editingDebt.dueDate,
      note: (editingDebt.note || '').trim(),
      isSettled: !!editingDebt.isSettled,
      createdAt: editingDebt.createdAt || Date.now(),
    });

    setIsModalOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {t.tabDebts}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'mr'
                ? 'उधारी, दिलेले व घेतलेले पैसे यांचा सोपा हिशोब'
                : 'Track money you lent to others & money you owe'}
            </p>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => handleOpenAdd('to_receive')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
            >
              <Plus size={14} />
              <span>+{language === 'mr' ? 'येणे (Lent)' : 'Lent'}</span>
            </button>
            <button
              onClick={() => handleOpenAdd('to_pay')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
            >
              <Plus size={14} />
              <span>+{language === 'mr' ? 'देणे (Borrow)' : 'Borrowed'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-0.5">
              <ArrowDownLeft size={16} />
              <span>{t.toReceive}</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-emerald-700 tabular-nums">
              {privacyMode ? '₹••••••' : `+${currency.symbol}${totalToReceive.toLocaleString()}`}
            </div>
            <span className="text-[10px] text-emerald-600/90">
              {language === 'mr' ? 'लोकांकडून येणे बाकी' : 'Total you will receive'}
            </span>
          </div>

          <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-0.5">
              <ArrowUpRight size={16} />
              <span>{t.toPay}</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-rose-700 tabular-nums">
              {privacyMode ? '₹••••••' : `-${currency.symbol}${totalToPay.toLocaleString()}`}
            </div>
            <span className="text-[10px] text-rose-600/90">
              {language === 'mr' ? 'इतरांना देणे बाकी' : 'Total you need to pay'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl">
        {(['pending', 'all', 'settled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
              filter === tab
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'pending'
              ? t.pending
              : tab === 'settled'
              ? t.settled
              : t.all}
          </button>
        ))}
      </div>

      {/* Debts List */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {filteredDebts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold">
              {language === 'mr' ? 'कोणतीही उधारी नोंद आढळली नाही.' : 'No debt/loan records found.'}
            </p>
          </div>
        ) : (
          filteredDebts.map((d) => {
            const isToReceive = d.type === 'to_receive';
            const isConfirmingThisDebt = deletingDebtId === d.id;

            return (
              <div
                key={d.id}
                onClick={() => handleOpenEdit(d)}
                className={`p-3.5 sm:px-4 flex items-center justify-between cursor-pointer transition-colors ${
                  d.isSettled ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isToReceive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {isToReceive ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {d.personName}
                      </h4>
                      {d.isSettled ? (
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                          {t.settled}
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isToReceive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isToReceive ? t.toReceive : t.toPay}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                      {d.note && <span className="truncate">{d.note}</span>}
                      {d.dueDate && (
                        <>
                          {d.note && <span>·</span>}
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock size={11} /> {d.dueDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-extrabold tabular-nums ${
                        isToReceive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {privacyMode
                        ? '₹••••••'
                        : `${isToReceive ? '+' : '-'}${currency.symbol}${d.amount.toLocaleString()}`}
                    </div>
                  </div>

                  {/* Mark as Settled / Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSettled(d.id);
                    }}
                    className={`p-2 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
                      d.isSettled
                        ? 'text-slate-400 hover:text-slate-600 bg-slate-100'
                        : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                    }`}
                    title={d.isSettled ? 'Mark Pending' : 'Mark Settled'}
                  >
                    <CheckCircle2 size={18} />
                  </button>

                  {/* Inline Delete Confirmation */}
                  {isConfirmingThisDebt ? (
                    <div
                      className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl px-2 py-1 shadow-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[11px] font-bold text-rose-700">
                        {language === 'mr' ? 'काढायचे?' : 'Delete?'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDebt(d.id);
                          setDeletingDebtId(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
                      >
                        {language === 'mr' ? 'होय' : 'Yes'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingDebtId(null);
                        }}
                        className="px-1.5 py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingDebtId(d.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 active:scale-95 transition-colors"
                      title={t.delete}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Debt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-5 space-y-4 animate-in fade-in slide-in-from-bottom">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {debts.some((d) => d.id === editingDebt.id)
                  ? language === 'mr'
                    ? 'उधारी संपादन (Edit Debt)'
                    : 'Edit Debt Record'
                  : t.addDebt}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setShowModalDeleteConfirm(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Inline Confirm Delete in Modal */}
            {showModalDeleteConfirm && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">
                  {language === 'mr' ? 'ही नोंद कायमची हटवायची आहे का?' : 'Delete this record?'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingDebt.id) {
                        onDeleteDebt(editingDebt.id);
                        setIsModalOpen(false);
                        setShowModalDeleteConfirm(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 shadow-xs"
                  >
                    {language === 'mr' ? 'होय, हटवा' : 'Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModalDeleteConfirm(false)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditingDebt({ ...editingDebt, type: 'to_receive' })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    editingDebt.type === 'to_receive'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.toReceive}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDebt({ ...editingDebt, type: 'to_pay' })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    editingDebt.type === 'to_pay'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.toPay}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.personName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul, Ramesh, Shop"
                  value={editingDebt.personName || ''}
                  onChange={(e) => setEditingDebt({ ...editingDebt, personName: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.amount} ({currency.symbol}) *
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  required
                  placeholder="0.00"
                  value={editingDebt.amount || ''}
                  onChange={(e) => setEditingDebt({ ...editingDebt, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold tabular-nums focus:outline-hidden focus:border-[#d32f2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.dueDate}
                </label>
                <input
                  type="date"
                  value={editingDebt.dueDate || ''}
                  onChange={(e) => setEditingDebt({ ...editingDebt, dueDate: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.note}
                </label>
                <input
                  type="text"
                  placeholder="Reason / Details"
                  value={editingDebt.note || ''}
                  onChange={(e) => setEditingDebt({ ...editingDebt, note: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {debts.some((d) => d.id === editingDebt.id) && (
                  <button
                    type="button"
                    onClick={() => setShowModalDeleteConfirm(true)}
                    className="px-3 min-h-[44px] py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition-colors"
                  >
                    <Trash2 size={15} />
                    <span>{t.delete}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowModalDeleteConfirm(false);
                  }}
                  className="flex-1 min-h-[44px] py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2 rounded-xl bg-[#d32f2f] text-white font-bold text-xs hover:bg-rose-800 shadow-xs"
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
