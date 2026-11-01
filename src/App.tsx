import React, { useState, useEffect, useMemo } from 'react';
import type { User } from 'firebase/auth';
import {
  Account,
  Budget,
  Category,
  CurrencyConfig,
  DebtRecord,
  FilterOptions,
  Language,
  Transaction,
  TransactionType,
  ViewTab,
} from './types';
import {
  getStoredLanguage,
  setStoredLanguage,
  getStoredCurrency,
  setStoredCurrency,
  getStoredPrivacyMode,
  setStoredPrivacyMode,
  loadStoredAccounts,
  saveStoredAccounts,
  loadStoredCategories,
  saveStoredCategories,
  loadStoredBudgets,
  saveStoredBudgets,
  loadStoredDebts,
  saveStoredDebts,
  loadStoredTransactions,
  saveStoredTransactions,
  resetToZeroBalance,
  loadDemoSeed,
} from './utils/storage';
import {
  signInWithGoogle,
  signInAsGuest,
  logOut,
  onAuthStatusChanged,
} from './firebase';
import {
  syncAllToCloud,
  loadAllFromCloud,
  saveTransactionToCloud,
  deleteTransactionFromCloud,
  saveDebtToCloud,
  deleteDebtFromCloud,
} from './utils/firebaseSync';
import { Header } from './components/Header';
import { DailyView } from './components/DailyView';
import { CalendarView } from './components/CalendarView';
import { WeeklyView } from './components/WeeklyView';
import { MonthlyView } from './components/MonthlyView';
import { TotalView } from './components/TotalView';
import { StatsView } from './components/StatsView';
import { AccountsView } from './components/AccountsView';
import { BudgetView } from './components/BudgetView';
import { DebtsView } from './components/DebtsView';
import { TransactionModal } from './components/TransactionModal';
import { FilterSearchModal } from './components/FilterSearchModal';
import { BackupModal } from './components/BackupModal';
import { BottomNav } from './components/BottomNav';
import { translations } from './data/translations';

export default function App() {
  // App Core State (Default language is English as requested)
  const [language, setLanguage] = useState<Language>(getStoredLanguage);
  const [currency, setCurrency] = useState<CurrencyConfig>(getStoredCurrency);
  const [privacyMode, setPrivacyMode] = useState<boolean>(getStoredPrivacyMode);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<ViewTab>('daily');

  // Stored Collections
  const [accounts, setAccounts] = useState<Account[]>(loadStoredAccounts);
  const [categories, setCategories] = useState<Category[]>(loadStoredCategories);
  const [budgets, setBudgets] = useState<Budget[]>(loadStoredBudgets);
  const [debts, setDebts] = useState<DebtRecord[]>(loadStoredDebts);
  const [transactions, setTransactions] = useState<Transaction[]>(loadStoredTransactions);

  // Firebase Authentication & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    const stored = localStorage.getItem('dhan_last_cloud_sync');
    return stored ? new Date(stored).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [presetDate, setPresetDate] = useState<string | undefined>();
  const [presetAccountId, setPresetAccountId] = useState<string | undefined>();
  const [presetType, setPresetType] = useState<TransactionType | undefined>();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchQuery: '',
    type: 'all',
    accountId: '',
    categoryId: '',
  });

  // Listen to Firebase Auth Status
  useEffect(() => {
    const unsubscribe = onAuthStatusChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const cloudData = await loadAllFromCloud(user.uid);
          if (cloudData && (cloudData.transactions.length > 0 || cloudData.accounts.length > 0)) {
            // Populate cloud state if local has no transactions or is freshly initialized
            if (transactions.length === 0) {
              if (cloudData.transactions) setTransactions(cloudData.transactions);
              if (cloudData.accounts) setAccounts(cloudData.accounts);
              if (cloudData.categories) setCategories(cloudData.categories);
              if (cloudData.budgets) setBudgets(cloudData.budgets);
              if (cloudData.debts) setDebts(cloudData.debts);
            }
          }
        } catch (err) {
          console.warn('Initial cloud sync check:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync state to local storage (Offline First)
  useEffect(() => {
    saveStoredAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveStoredCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveStoredBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveStoredDebts(debts);
  }, [debts]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  const handleSelectLanguage = (newLang: Language) => {
    setLanguage(newLang);
    setStoredLanguage(newLang);
  };

  const handleTogglePrivacy = () => {
    setPrivacyMode((prev) => {
      const next = !prev;
      setStoredPrivacyMode(next);
      return next;
    });
  };

  const handleSelectCurrency = (newCurr: CurrencyConfig) => {
    setCurrency(newCurr);
    setStoredCurrency(newCurr);
  };

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSelectMonth = (year: number, monthIndex: number) => {
    setCurrentDate(new Date(year, monthIndex, 1));
    setActiveTab('daily');
  };

  // Monthly filtered transactions
  const monthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date.startsWith(monthPrefix));
  }, [transactions, monthPrefix]);

  // Filtered transactions (accounting for search and custom filters)
  const isFilterActive =
    !!filterOptions.searchQuery ||
    filterOptions.type !== 'all' ||
    !!filterOptions.accountId ||
    !!filterOptions.categoryId;

  const displayTransactions = useMemo(() => {
    return currentMonthTransactions.filter((tx) => {
      if (filterOptions.type !== 'all' && tx.type !== filterOptions.type) return false;
      if (filterOptions.accountId && tx.accountId !== filterOptions.accountId && tx.toAccountId !== filterOptions.accountId) return false;
      if (filterOptions.categoryId && tx.categoryId !== filterOptions.categoryId) return false;
      if (filterOptions.searchQuery) {
        const query = filterOptions.searchQuery.toLowerCase();
        const noteMatch = tx.note?.toLowerCase().includes(query);
        const payeeMatch = tx.payee?.toLowerCase().includes(query);
        if (!noteMatch && !payeeMatch) return false;
      }
      return true;
    });
  }, [currentMonthTransactions, filterOptions]);

  // Monthly Income and Expense
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    currentMonthTransactions.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      if (tx.type === 'expense') expense += tx.amount;
    });
    return { totalIncome: income, totalExpense: expense };
  }, [currentMonthTransactions]);

  // Firebase Handlers
  const handleSignInGoogle = async () => {
    const user = await signInWithGoogle();
    if (user) {
      await handleSyncToCloud(user.uid, user.email);
    }
  };

  const handleSignInGuest = async () => {
    const user = await signInAsGuest();
    if (user) {
      await handleSyncToCloud(user.uid, user.email);
    }
  };

  const handleSignOut = async () => {
    await logOut();
    setCurrentUser(null);
  };

  const handleSyncToCloud = async (overrideUid?: string, overrideEmail?: string | null) => {
    const uid = overrideUid || currentUser?.uid;
    if (!uid) return;
    setIsSyncing(true);
    try {
      const res = await syncAllToCloud(uid, overrideEmail !== undefined ? overrideEmail : (currentUser?.email || null), {
        accounts,
        categories,
        transactions,
        budgets,
        debts,
        language,
        currency,
      });
      if (res.success) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(now);
      }
    } catch (error) {
      console.error('Error during cloud sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!currentUser?.uid) return;
    setIsSyncing(true);
    try {
      const cloudData = await loadAllFromCloud(currentUser.uid);
      if (cloudData) {
        if (cloudData.transactions) setTransactions(cloudData.transactions);
        if (cloudData.accounts) setAccounts(cloudData.accounts);
        if (cloudData.categories) setCategories(cloudData.categories);
        if (cloudData.budgets) setBudgets(cloudData.budgets);
        if (cloudData.debts) setDebts(cloudData.debts);
        if (cloudData.language) handleSelectLanguage(cloudData.language);
        alert(language === 'mr' ? 'क्लाउडवरून डेटा यशस्वीरीत्या रिस्टोअर झाला!' : 'Data successfully restored from Firebase Cloud!');
      } else {
        alert(language === 'mr' ? 'क्लाउडवर आधीचा डेटा सापडला नाही.' : 'No existing cloud data found.');
      }
    } catch (error) {
      console.error('Failed to restore from cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Transaction Actions
  const handleOpenAddModal = (pDate?: string, pAccountId?: string, pType?: TransactionType) => {
    setEditingTransaction(null);
    setPresetDate(pDate);
    setPresetAccountId(pAccountId);
    setPresetType(pType);
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setPresetDate(tx.date);
    setPresetAccountId(tx.accountId);
    setPresetType(tx.type);
    setIsAddModalOpen(true);
  };

  const handleSaveTransaction = (savedTx: Transaction) => {
    setTransactions((prev) => {
      const idx = prev.findIndex((t) => t.id === savedTx.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedTx;
        return copy;
      }
      return [savedTx, ...prev];
    });

    if (currentUser?.uid) {
      saveTransactionToCloud(currentUser.uid, savedTx);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (currentUser?.uid) {
      deleteTransactionFromCloud(currentUser.uid, id);
    }
  };

  // Account Actions
  const handleSaveAccount = (acc: Account) => {
    setAccounts((prev) => {
      const idx = prev.findIndex((a) => a.id === acc.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = acc;
        return copy;
      }
      return [...prev, acc];
    });
  };

  const handleDeleteAccount = (accId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accId));
  };

  // Budget Actions
  const handleSaveBudget = (budget: Budget) => {
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.categoryId === budget.categoryId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = budget;
        return copy;
      }
      return [...prev, budget];
    });
  };

  const handleDeleteBudget = (categoryId: string) => {
    setBudgets((prev) => prev.filter((b) => b.categoryId !== categoryId));
  };

  // Debt Actions
  const handleSaveDebt = (debt: DebtRecord) => {
    setDebts((prev) => {
      const idx = prev.findIndex((d) => d.id === debt.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = debt;
        return copy;
      }
      return [debt, ...prev];
    });

    if (currentUser?.uid) {
      saveDebtToCloud(currentUser.uid, debt);
    }
  };

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
    if (currentUser?.uid) {
      deleteDebtFromCloud(currentUser.uid, id);
    }
  };

  const handleToggleSettledDebt = (id: string) => {
    setDebts((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, isSettled: !d.isSettled } : d));
      const target = updated.find((d) => d.id === id);
      if (target && currentUser?.uid) {
        saveDebtToCloud(currentUser.uid, target);
      }
      return updated;
    });
  };

  // Custom Category
  const handleAddCustomCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
  };

  // Reset to Zero Balance
  const handleResetToZero = () => {
    const res = resetToZeroBalance();
    setAccounts(res.accounts);
    setTransactions(res.transactions);
    setBudgets(res.budgets);
    setDebts(res.debts);
  };

  // Load Demo Data
  const handleLoadDemoData = () => {
    const res = loadDemoSeed();
    setAccounts(res.accounts);
    setTransactions(res.transactions);
    setBudgets(res.budgets);
    setDebts(res.debts);
  };

  // Restore Backup
  const handleRestoreData = (data: {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
    budgets: Budget[];
    debts?: DebtRecord[];
  }) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.accounts) setAccounts(data.accounts);
    if (data.categories) setCategories(data.categories);
    if (data.budgets) setBudgets(data.budgets);
    if (data.debts) setDebts(data.debts);
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-28 sm:pb-12 text-slate-800">
      {/* Realbyte-Style Sticky Header with Firebase Cloud Status */}
      <Header
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        currency={currency}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenAddModal={() => handleOpenAddModal()}
        currentUser={currentUser}
        isSyncing={isSyncing}
      />

      {/* Filter Active Badge */}
      {isFilterActive && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs flex items-center justify-between">
            <span>
              {language === 'mr' ? 'फिल्टर सक्रिय आहे' : 'Filter active'}:{' '}
              {filterOptions.searchQuery && `"${filterOptions.searchQuery}" `}
              {filterOptions.type !== 'all' && `[${filterOptions.type}] `}
            </span>
            <button
              onClick={() =>
                setFilterOptions({
                  searchQuery: '',
                  type: 'all',
                  accountId: '',
                  categoryId: '',
                })
              }
              className="font-bold underline text-xs"
            >
              {t.clearFilter}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area by Active Tab */}
      <main className="flex-1">
        {activeTab === 'daily' && (
          <DailyView
            transactions={displayTransactions}
            categories={categories}
            accounts={accounts}
            currency={currency}
            language={language}
            onEditTransaction={handleEditTransaction}
            onAddTransaction={(preset) => handleOpenAddModal(preset)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            currentDate={currentDate}
            transactions={currentMonthTransactions}
            categories={categories}
            accounts={accounts}
            currency={currency}
            language={language}
            onEditTransaction={handleEditTransaction}
            onAddTransaction={(preset) => handleOpenAddModal(preset)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {/* Debts & Loans Manager */}
        {activeTab === 'debts' && (
          <DebtsView
            debts={debts}
            currency={currency}
            language={language}
            privacyMode={privacyMode}
            onSaveDebt={handleSaveDebt}
            onDeleteDebt={handleDeleteDebt}
            onToggleSettled={handleToggleSettledDebt}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyView
            currentDate={currentDate}
            transactions={currentMonthTransactions}
            categories={categories}
            accounts={accounts}
            currency={currency}
            language={language}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyView
            currentDate={currentDate}
            allTransactions={transactions}
            currency={currency}
            language={language}
            onSelectMonth={handleSelectMonth}
          />
        )}

        {activeTab === 'total' && (
          <TotalView
            accounts={accounts}
            transactions={currentMonthTransactions}
            allTransactions={transactions}
            currency={currency}
            language={language}
            privacyMode={privacyMode}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            transactions={currentMonthTransactions}
            categories={categories}
            currency={currency}
            language={language}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            accounts={accounts}
            transactions={transactions}
            currency={currency}
            language={language}
            onSaveAccount={handleSaveAccount}
            onDeleteAccount={handleDeleteAccount}
            onOpenTransfer={(accId) => handleOpenAddModal(undefined, accId, 'transfer')}
            onEditTransaction={handleEditTransaction}
          />
        )}

      </main>

      {/* Fixed Bottom Navigation with Thumb Controls & Floating Action Button */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenSettings={() => setIsBackupModalOpen(true)}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        editingTransaction={editingTransaction}
        accounts={accounts}
        categories={categories}
        currency={currency}
        language={language}
        presetDate={presetDate}
        presetAccountId={presetAccountId}
        presetType={presetType}
        onAddCustomCategory={handleAddCustomCategory}
      />

      <FilterSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        filterOptions={filterOptions}
        onChangeFilter={setFilterOptions}
        accounts={accounts}
        categories={categories}
        language={language}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        transactions={transactions}
        categories={categories}
        accounts={accounts}
        budgets={budgets}
        debts={debts}
        currency={currency}
        onSelectCurrency={handleSelectCurrency}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        onResetToZero={handleResetToZero}
        onLoadDemoData={handleLoadDemoData}
        onRestoreData={handleRestoreData}
        currentUser={currentUser}
        onSignInGoogle={handleSignInGoogle}
        onSignInGuest={handleSignInGuest}
        onSignOut={handleSignOut}
        onSyncToCloud={() => handleSyncToCloud()}
        onRestoreFromCloud={handleRestoreFromCloud}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />
    </div>
  );
}
