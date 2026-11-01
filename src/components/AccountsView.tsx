import React, { useState } from 'react';
import { Plus, Wallet, Landmark, CreditCard, PiggyBank, ArrowRightLeft, Edit2, Trash2 } from 'lucide-react';
import { Account, AccountType, CurrencyConfig, Language, Transaction } from '../types';
import { translations } from '../data/translations';
import { calculateAccountBalances } from '../utils/storage';

interface AccountsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  currency: CurrencyConfig;
  language: Language;
  onSaveAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onOpenTransfer: (fromAccountId: string) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  currency,
  language,
  onSaveAccount,
  onDeleteAccount,
  onOpenTransfer,
  onEditTransaction,
}) => {
  const t = translations[language];
  const balances = calculateAccountBalances(accounts, transactions);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [confirmDeleteAccId, setConfirmDeleteAccId] = useState<string | null>(null);
  const [isEditingAccount, setIsEditingAccount] = useState<boolean>(false);
  const [editingAcc, setEditingAcc] = useState<Partial<Account>>({
    name: '',
    nameMr: '',
    type: 'cash',
    initialBalance: 0,
    color: '#3b82f6',
    icon: 'Landmark',
  });

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // Filter transactions for selected account
  const accountTransactions = transactions
    .filter((tx) => tx.accountId === selectedAccountId || tx.toAccountId === selectedAccountId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleOpenAdd = () => {
    setEditingAcc({
      id: `acc_${Date.now()}`,
      name: '',
      nameMr: '',
      type: 'bank',
      initialBalance: 0,
      color: '#3b82f6',
      icon: 'Landmark',
    });
    setIsEditingAccount(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAcc({ ...acc });
    setIsEditingAccount(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcc.name) return;
    onSaveAccount(editingAcc as Account);
    setIsEditingAccount(false);
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'cash':
        return <Wallet size={20} className="text-emerald-600" />;
      case 'bank':
        return <Landmark size={20} className="text-blue-600" />;
      case 'card':
        return <CreditCard size={20} className="text-orange-600" />;
      default:
        return <PiggyBank size={20} className="text-purple-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Accounts List Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            {t.manageAccounts}
          </h3>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#d32f2f] text-white font-bold text-xs hover:bg-rose-800 transition-colors"
          >
            <Plus size={15} />
            <span>{t.addAccount}</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {accounts.map((acc) => {
            const bal = balances[acc.id] || 0;
            const isSelected = selectedAccountId === acc.id;

            return (
              <div
                key={acc.id}
                className={`transition-colors ${isSelected ? 'bg-rose-50/20' : 'hover:bg-slate-50'}`}
              >
                <div
                  onClick={() => setSelectedAccountId(isSelected ? null : acc.id)}
                  className="p-3 sm:px-4 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-800 truncate">
                        {language === 'mr' && acc.nameMr ? acc.nameMr : acc.name}
                      </div>
                      <div className="text-xs text-slate-400 capitalize flex items-center gap-2">
                        <span>{acc.type}</span>
                        {acc.initialBalance !== 0 && (
                          <span>· सुरुवातीस {currency.symbol}{acc.initialBalance}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-bold tabular-nums ${
                          bal >= 0 ? 'text-slate-900' : 'text-rose-600'
                        }`}
                      >
                        {bal >= 0 ? '' : '-'}{currency.symbol}{Math.abs(bal).toLocaleString()}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {language === 'mr' ? 'चालू शिल्लक' : 'Current Balance'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(acc);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Account"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Quick Action Strip when selected */}
                {isSelected && (
                  <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onOpenTransfer(acc.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <ArrowRightLeft size={14} />
                      <span>{language === 'mr' ? 'या खात्यातून पैसे पाठवा (Transfer)' : 'Transfer from here'}</span>
                    </button>

                    {accounts.length > 1 && (
                      confirmDeleteAccId === acc.id ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg px-2 py-0.5 shadow-xs">
                          <span className="text-[10px] font-bold text-rose-700">
                            {language === 'mr' ? 'काढायचे?' : 'Delete?'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteAccount(acc.id);
                              setSelectedAccountId(null);
                              setConfirmDeleteAccId(null);
                            }}
                            className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                          >
                            {language === 'mr' ? 'होय' : 'Yes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteAccId(null)}
                            className="text-slate-400 hover:text-slate-700 text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteAccId(acc.id)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          <span>{t.delete}</span>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Transactions Statement */}
      {selectedAccount && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-800">
              {language === 'mr' && selectedAccount.nameMr ? selectedAccount.nameMr : selectedAccount.name} -{' '}
              {language === 'mr' ? 'व्यवहार इतिहास' : 'Statement'}
            </span>
            <span className="text-xs text-slate-500">
              {accountTransactions.length} {language === 'mr' ? 'नोंदी' : 'records'}
            </span>
          </div>

          {accountTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {language === 'mr' ? 'या खात्यात अद्याप व्यवहार नाहीत.' : 'No transactions recorded for this account.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {accountTransactions.map((tx) => {
                const isIncoming = tx.type === 'income' || (tx.type === 'transfer' && tx.toAccountId === selectedAccountId);
                const isOutgoing = tx.type === 'expense' || (tx.type === 'transfer' && tx.accountId === selectedAccountId);

                return (
                  <div
                    key={tx.id}
                    onClick={() => onEditTransaction(tx)}
                    className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {tx.note || (tx.type === 'transfer' ? 'Transfer' : 'Transaction')}
                      </div>
                      <div className="text-slate-400 mt-0.5">
                        {tx.date} {tx.time && `· ${tx.time}`}
                      </div>
                    </div>

                    <div
                      className={`text-sm font-bold tabular-nums ${
                        isIncoming ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncoming ? '+' : '-'}{currency.symbol}{tx.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Account Edit / Add Modal */}
      {isEditingAccount && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#d32f2f] text-white px-5 py-3 font-bold text-base flex justify-between items-center">
              <span>{editingAcc.id ? (language === 'mr' ? 'खाते संपादन' : 'Edit Account') : t.addAccount}</span>
              <button
                type="button"
                onClick={() => setIsEditingAccount(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.accountName} (English)
                </label>
                <input
                  type="text"
                  required
                  value={editingAcc.name || ''}
                  onChange={(e) => setEditingAcc({ ...editingAcc, name: e.target.value })}
                  placeholder="e.g. HDFC Bank / Cash"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'खात्याचे नाव (मराठीत)' : 'Account Name (Marathi)'}
                </label>
                <input
                  type="text"
                  value={editingAcc.nameMr || ''}
                  onChange={(e) => setEditingAcc({ ...editingAcc, nameMr: e.target.value })}
                  placeholder="उदा. एचडीएफसी बँक / रोख"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.accountType}
                </label>
                <select
                  value={editingAcc.type || 'bank'}
                  onChange={(e) => setEditingAcc({ ...editingAcc, type: e.target.value as AccountType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f] bg-white"
                >
                  <option value="cash">{t.cash}</option>
                  <option value="bank">{t.bank}</option>
                  <option value="card">{t.card}</option>
                  <option value="savings">{t.savings}</option>
                  <option value="investment">{t.investment}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.initialBalance} ({currency.symbol})
                </label>
                <input
                  type="number"
                  value={editingAcc.initialBalance || 0}
                  onChange={(e) => setEditingAcc({ ...editingAcc, initialBalance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#d32f2f]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'mr'
                    ? 'आपण हे ₹० ठेवून नवीन सुरुवात करू शकता.'
                    : 'You can keep this ₹0 to start fresh with zero balance.'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAccount(false)}
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
