import { Account, Budget, Category, CurrencyConfig, DebtRecord, Language, Transaction } from '../types';
import { DEFAULT_ACCOUNTS, DEFAULT_BUDGETS, DEFAULT_CATEGORIES, DEFAULT_CURRENCIES, getDemoTransactions } from '../data/initialData';

const KEYS = {
  TRANSACTIONS: 'dhan_transactions_v1',
  ACCOUNTS: 'dhan_accounts_v1',
  CATEGORIES: 'dhan_categories_v1',
  BUDGETS: 'dhan_budgets_v1',
  DEBTS: 'dhan_debts_v1',
  PRIVACY: 'dhan_privacy_v1',
  LANGUAGE: 'dhan_lang_v1',
  CURRENCY: 'dhan_curr_v1',
  INITIALIZED: 'dhan_initialized_v1',
};

const VALID_LANGS: Language[] = ['mr', 'en', 'hi', 'gu', 'ta', 'te', 'kn', 'bn'];

export const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem(KEYS.LANGUAGE) as Language;
  return VALID_LANGS.includes(stored) ? stored : 'en'; // default English as requested
};

export const setStoredLanguage = (lang: Language) => {
  localStorage.setItem(KEYS.LANGUAGE, lang);
};

export const getStoredPrivacyMode = (): boolean => {
  return localStorage.getItem(KEYS.PRIVACY) === 'true';
};

export const setStoredPrivacyMode = (val: boolean) => {
  localStorage.setItem(KEYS.PRIVACY, val ? 'true' : 'false');
};

export const getStoredCurrency = (): CurrencyConfig => {
  const stored = localStorage.getItem(KEYS.CURRENCY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return DEFAULT_CURRENCIES[0]; // INR ₹
};

export const setStoredCurrency = (curr: CurrencyConfig) => {
  localStorage.setItem(KEYS.CURRENCY, JSON.stringify(curr));
};

export const loadStoredAccounts = (): Account[] => {
  const stored = localStorage.getItem(KEYS.ACCOUNTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return DEFAULT_ACCOUNTS;
};

export const saveStoredAccounts = (accounts: Account[]) => {
  localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
};

export const loadStoredCategories = (): Category[] => {
  const stored = localStorage.getItem(KEYS.CATEGORIES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return DEFAULT_CATEGORIES;
};

export const saveStoredCategories = (categories: Category[]) => {
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
};

export const loadStoredBudgets = (): Budget[] => {
  const stored = localStorage.getItem(KEYS.BUDGETS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return DEFAULT_BUDGETS;
};

export const saveStoredBudgets = (budgets: Budget[]) => {
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
};

export const loadStoredDebts = (): DebtRecord[] => {
  const stored = localStorage.getItem(KEYS.DEBTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [
    {
      id: 'debt_1',
      type: 'to_receive',
      personName: 'Rahul Sharma',
      amount: 2500,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      note: 'Lent for urgent medical bill',
      isSettled: false,
      createdAt: Date.now() - 3 * 86400000,
    },
    {
      id: 'debt_2',
      type: 'to_pay',
      personName: 'Ramesh Kirana Store',
      amount: 850,
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      note: 'Monthly groceries pending bill',
      isSettled: false,
      createdAt: Date.now() - 5 * 86400000,
    },
  ];
};

export const saveStoredDebts = (debts: DebtRecord[]) => {
  localStorage.setItem(KEYS.DEBTS, JSON.stringify(debts));
};

export const loadStoredTransactions = (): Transaction[] => {
  const isInit = localStorage.getItem(KEYS.INITIALIZED);
  if (!isInit) {
    const demo = getDemoTransactions();
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(demo));
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    return demo;
  }

  const stored = localStorage.getItem(KEYS.TRANSACTIONS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export const saveStoredTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const resetToZeroBalance = (): {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: DebtRecord[];
} => {
  const freshAccounts = DEFAULT_ACCOUNTS.map((a) => ({
    ...a,
    initialBalance: 0,
    currentBalance: 0,
  }));
  const emptyTransactions: Transaction[] = [];
  const defaultBudgets: Budget[] = [];
  const emptyDebts: DebtRecord[] = [];

  localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(freshAccounts));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(emptyTransactions));
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(defaultBudgets));
  localStorage.setItem(KEYS.DEBTS, JSON.stringify(emptyDebts));
  localStorage.setItem(KEYS.INITIALIZED, 'true');

  return { accounts: freshAccounts, transactions: emptyTransactions, budgets: defaultBudgets, debts: emptyDebts };
};

export const loadDemoSeed = (): {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: DebtRecord[];
} => {
  const demoTxs = getDemoTransactions();
  const demoAccounts = DEFAULT_ACCOUNTS.map((a) => {
    if (a.id === 'acc_bank') return { ...a, initialBalance: 50000 };
    if (a.id === 'acc_cash') return { ...a, initialBalance: 2000 };
    return { ...a, initialBalance: 0 };
  });
  const demoBudgets = DEFAULT_BUDGETS;
  const demoDebts: DebtRecord[] = [
    {
      id: 'debt_1',
      type: 'to_receive',
      personName: 'Rahul Sharma',
      amount: 2500,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      note: 'Lent for urgent medical bill',
      isSettled: false,
      createdAt: Date.now() - 3 * 86400000,
    },
    {
      id: 'debt_2',
      type: 'to_pay',
      personName: 'Ramesh Kirana Store',
      amount: 850,
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      note: 'Monthly groceries pending bill',
      isSettled: false,
      createdAt: Date.now() - 5 * 86400000,
    },
  ];

  localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(demoAccounts));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(demoTxs));
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(demoBudgets));
  localStorage.setItem(KEYS.DEBTS, JSON.stringify(demoDebts));
  localStorage.setItem(KEYS.INITIALIZED, 'true');

  return { accounts: demoAccounts, transactions: demoTxs, budgets: demoBudgets, debts: demoDebts };
};

// Calculate calculated balances for all accounts
export const calculateAccountBalances = (accounts: Account[], transactions: Transaction[]): Record<string, number> => {
  const balances: Record<string, number> = {};

  accounts.forEach((acc) => {
    balances[acc.id] = acc.initialBalance || 0;
  });

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      balances[tx.accountId] = (balances[tx.accountId] || 0) + tx.amount;
    } else if (tx.type === 'expense') {
      balances[tx.accountId] = (balances[tx.accountId] || 0) - tx.amount;
    } else if (tx.type === 'transfer' && tx.toAccountId) {
      balances[tx.accountId] = (balances[tx.accountId] || 0) - tx.amount;
      balances[tx.toAccountId] = (balances[tx.toAccountId] || 0) + tx.amount;
    }
  });

  return balances;
};

// Export to CSV
export const exportTransactionsToCSV = (
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  currencySymbol: string
) => {
  const headers = ['ID', 'Date', 'Time', 'Type', 'Amount (' + currencySymbol + ')', 'Category', 'Account', 'To Account', 'Note', 'Payee'];

  const getCatName = (id: string) => categories.find((c) => c.id === id)?.name || id || '-';
  const getAccName = (id: string) => accounts.find((a) => a.id === id)?.name || id || '-';

  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.time || '',
    t.type.toUpperCase(),
    t.amount.toFixed(2),
    `"${getCatName(t.categoryId).replace(/"/g, '""')}"`,
    `"${getAccName(t.accountId).replace(/"/g, '""')}"`,
    t.toAccountId ? `"${getAccName(t.toAccountId).replace(/"/g, '""')}"` : '',
    `"${(t.note || '').replace(/"/g, '""')}"`,
    `"${(t.payee || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `DhanPrabandhak_Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export JSON Backup
export const downloadJSONBackup = (data: {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  debts?: DebtRecord[];
}) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `DhanPrabandhak_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
