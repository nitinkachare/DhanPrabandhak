export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'cash' | 'bank' | 'card' | 'savings' | 'investment' | 'other';

export interface Account {
  id: string;
  name: string;
  nameMr: string;
  type: AccountType;
  initialBalance: number;
  color: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  nameMr: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  accountId: string;
  toAccountId?: string; // used for transfer
  categoryId: string;
  note: string;
  payee?: string;
  receiptImage?: string; // base64 / data URL
  createdAt: number;
}

export interface Budget {
  categoryId: string;
  amount: number;
}

export interface DebtRecord {
  id: string;
  type: 'to_receive' | 'to_pay'; // to_receive (Lent/You'll get) vs to_pay (Borrowed/You'll give)
  personName: string;
  amount: number;
  dueDate?: string;
  note: string;
  isSettled: boolean;
  createdAt: number;
}

export type ViewTab = 'daily' | 'calendar' | 'weekly' | 'monthly' | 'total' | 'stats' | 'accounts' | 'budget' | 'debts' | 'settings';

export type Language = 'mr' | 'en' | 'hi' | 'gu' | 'ta' | 'te' | 'kn' | 'bn';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  nameMr: string;
}

export interface FilterOptions {
  searchQuery: string;
  type: 'all' | TransactionType;
  accountId: string;
  categoryId: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}
