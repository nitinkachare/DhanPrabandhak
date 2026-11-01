import { Account, Category, CurrencyConfig, Transaction, Budget } from '../types';

export const DEFAULT_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', nameMr: 'भारतीय रुपया' },
  { code: 'USD', symbol: '$', name: 'US Dollar', nameMr: 'अमेरिकन डॉलर' },
  { code: 'EUR', symbol: '€', name: 'Euro', nameMr: 'युरो' },
  { code: 'GBP', symbol: '£', name: 'British Pound', nameMr: 'ब्रिटिश पाउंड' },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_cash',
    name: 'Cash in Hand',
    nameMr: 'रोख रक्कम (Cash)',
    type: 'cash',
    initialBalance: 0,
    color: '#10b981',
    icon: 'Wallet',
  },
  {
    id: 'acc_bank',
    name: 'Bank Account (SBI)',
    nameMr: 'बँक खाते (SBI/बँक)',
    type: 'bank',
    initialBalance: 0,
    color: '#3b82f6',
    icon: 'Landmark',
  },
  {
    id: 'acc_upi',
    name: 'UPI / GPay / PhonePe',
    nameMr: 'UPI (गुगल पे/फोनपे)',
    type: 'savings',
    initialBalance: 0,
    color: '#8b5cf6',
    icon: 'Smartphone',
  },
  {
    id: 'acc_card',
    name: 'Credit Card',
    nameMr: 'क्रेडिट कार्ड',
    type: 'card',
    initialBalance: 0,
    color: '#f97316',
    icon: 'CreditCard',
  },
  {
    id: 'acc_savings',
    name: 'Savings / Emergency',
    nameMr: 'बचत निधी',
    type: 'savings',
    initialBalance: 0,
    color: '#06b6d4',
    icon: 'PiggyBank',
  },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: 'cat_food', name: 'Food & Dining', nameMr: 'अन्न व जेवण', type: 'expense', icon: 'Utensils', color: '#f43f5e' },
  { id: 'cat_groceries', name: 'Groceries', nameMr: 'किराणा सामान', type: 'expense', icon: 'ShoppingCart', color: '#fb923c' },
  { id: 'cat_transport', name: 'Transport & Fuel', nameMr: 'वाहतूक व पेट्रोल', type: 'expense', icon: 'Car', color: '#f59e0b' },
  { id: 'cat_bills', name: 'Bills & Utilities', nameMr: 'बिले व वीज/पाणी', type: 'expense', icon: 'Receipt', color: '#eab308' },
  { id: 'cat_mobile', name: 'Mobile & Internet', nameMr: 'मोबाईल व इंटरनेट', type: 'expense', icon: 'Wifi', color: '#84cc16' },
  { id: 'cat_shopping', name: 'Shopping & Clothes', nameMr: 'खरेदी व कपडे', type: 'expense', icon: 'ShoppingBag', color: '#10b981' },
  { id: 'cat_health', name: 'Health & Medical', nameMr: 'आरोग्य व औषधे', type: 'expense', icon: 'HeartPulse', color: '#06b6d4' },
  { id: 'cat_entertainment', name: 'Entertainment', nameMr: 'मनोरंजन व सिनेमा', type: 'expense', icon: 'Film', color: '#6366f1' },
  { id: 'cat_rent', name: 'Rent & Housing', nameMr: 'घरभाडे / दुरुस्ती', type: 'expense', icon: 'Home', color: '#a855f7' },
  { id: 'cat_education', name: 'Education', nameMr: 'शिक्षण व फी', type: 'expense', icon: 'GraduationCap', color: '#ec4899' },
  { id: 'cat_other_exp', name: 'Other Expense', nameMr: 'इतर खर्च', type: 'expense', icon: 'MoreHorizontal', color: '#64748b' },

  // Incomes
  { id: 'cat_salary', name: 'Salary', nameMr: 'पगार / वेतन', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { id: 'cat_business', name: 'Business / Profit', nameMr: 'व्यवसाय नफा', type: 'income', icon: 'TrendingUp', color: '#059669' },
  { id: 'cat_allowance', name: 'Pocket Money / Gifts', nameMr: 'भेट व पॉकेट मनी', type: 'income', icon: 'Gift', color: '#14b8a6' },
  { id: 'cat_investment', name: 'Investment Returns', nameMr: 'गुंतवणूक परतावा', type: 'income', icon: 'Coins', color: '#0284c7' },
  { id: 'cat_other_inc', name: 'Other Income', nameMr: 'इतर जमा', type: 'income', icon: 'DollarSign', color: '#475569' },
];

export const DEFAULT_BUDGETS: Budget[] = [
  { categoryId: 'cat_food', amount: 5000 },
  { categoryId: 'cat_groceries', amount: 4000 },
  { categoryId: 'cat_transport', amount: 2000 },
  { categoryId: 'cat_bills', amount: 2500 },
];

export const getDemoTransactions = (): Transaction[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const d = today.getDate();

  const getDateStr = (dayOffset: number) => {
    const targetDate = new Date(year, today.getMonth(), Math.max(1, d - dayOffset));
    return targetDate.toISOString().split('T')[0];
  };

  return [
    {
      id: 'tx_1',
      type: 'income',
      amount: 35000,
      date: getDateStr(5),
      time: '10:00',
      accountId: 'acc_bank',
      categoryId: 'cat_salary',
      note: 'Monthly Salary Credited (मासिक वेतन)',
      payee: 'Employer',
      createdAt: Date.now() - 5 * 86400000,
    },
    {
      id: 'tx_2',
      type: 'expense',
      amount: 1500,
      date: getDateStr(3),
      time: '14:30',
      accountId: 'acc_upi',
      categoryId: 'cat_groceries',
      note: 'D-Mart Monthly Grocery (किराणा खरेदी)',
      payee: 'DMart',
      createdAt: Date.now() - 3 * 86400000,
    },
    {
      id: 'tx_3',
      type: 'expense',
      amount: 450,
      date: getDateStr(2),
      time: '19:15',
      accountId: 'acc_cash',
      categoryId: 'cat_food',
      note: 'Dinner with family (हॉटेल जेवण)',
      payee: 'Hotel Swad',
      createdAt: Date.now() - 2 * 86400000,
    },
    {
      id: 'tx_4',
      type: 'expense',
      amount: 600,
      date: getDateStr(1),
      time: '09:45',
      accountId: 'acc_upi',
      categoryId: 'cat_transport',
      note: 'Petrol Bike refill (पेट्रोल भरले)',
      payee: 'HP Petrol Pump',
      createdAt: Date.now() - 1 * 86400000,
    },
    {
      id: 'tx_5',
      type: 'transfer',
      amount: 5000,
      date: getDateStr(1),
      time: '16:00',
      accountId: 'acc_bank',
      toAccountId: 'acc_cash',
      categoryId: '',
      note: 'ATM Cash Withdrawal (एटीएममधून पैसे काढले)',
      createdAt: Date.now() - 1 * 86400000,
    },
    {
      id: 'tx_6',
      type: 'expense',
      amount: 799,
      date: getDateStr(0),
      time: '12:20',
      accountId: 'acc_upi',
      categoryId: 'cat_mobile',
      note: 'Jio Mobile Recharge (३ महिन्यांचा रिचार्ज)',
      payee: 'Jio Prepaid',
      createdAt: Date.now(),
    },
  ];
};
