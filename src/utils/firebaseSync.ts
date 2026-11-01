import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Account, Budget, Category, CurrencyConfig, DebtRecord, Language, Transaction } from '../types';

export interface CloudData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: DebtRecord[];
  language?: Language;
  currency?: CurrencyConfig;
}

/**
 * Save user profile and settings to Firestore
 */
export const saveUserProfileToCloud = async (
  userId: string,
  userEmail: string | null,
  language: string,
  currencyCode: string
) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        userId,
        email: userEmail || '',
        language,
        currencyCode,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save user profile to cloud:', error);
  }
};

/**
 * Save / Update a single transaction in Firestore
 */
export const saveTransactionToCloud = async (userId: string, transaction: Transaction) => {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', transaction.id);
    await setDoc(txRef, transaction, { merge: true });
  } catch (error) {
    console.error('Failed to sync transaction to cloud:', error);
  }
};

/**
 * Delete a transaction from Firestore
 */
export const deleteTransactionFromCloud = async (userId: string, transactionId: string) => {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(txRef);
  } catch (error) {
    console.error('Failed to delete transaction from cloud:', error);
  }
};

/**
 * Save / Update a single debt record in Firestore
 */
export const saveDebtToCloud = async (userId: string, debt: DebtRecord) => {
  try {
    const debtRef = doc(db, 'users', userId, 'debts', debt.id);
    await setDoc(debtRef, debt, { merge: true });
  } catch (error) {
    console.error('Failed to sync debt to cloud:', error);
  }
};

/**
 * Delete a debt record from Firestore
 */
export const deleteDebtFromCloud = async (userId: string, debtId: string) => {
  try {
    const debtRef = doc(db, 'users', userId, 'debts', debtId);
    await deleteDoc(debtRef);
  } catch (error) {
    console.error('Failed to delete debt from cloud:', error);
  }
};

/**
 * Full cloud sync: Upload all local state to Firestore
 */
export const syncAllToCloud = async (
  userId: string,
  userEmail: string | null,
  data: CloudData
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Save user profile
    await saveUserProfileToCloud(
      userId,
      userEmail,
      data.language || 'en',
      data.currency?.code || 'INR'
    );

    // 2. Batch write accounts
    if (data.accounts.length > 0) {
      const batch = writeBatch(db);
      data.accounts.forEach((acc) => {
        const ref = doc(db, 'users', userId, 'accounts', acc.id);
        batch.set(ref, acc, { merge: true });
      });
      await batch.commit();
    }

    // 3. Batch write categories
    if (data.categories.length > 0) {
      const batch = writeBatch(db);
      data.categories.forEach((cat) => {
        const ref = doc(db, 'users', userId, 'categories', cat.id);
        batch.set(ref, cat, { merge: true });
      });
      await batch.commit();
    }

    // 4. Batch write transactions in chunks of 450 (Firestore limit is 500 per batch)
    const chunkSize = 400;
    for (let i = 0; i < data.transactions.length; i += chunkSize) {
      const chunk = data.transactions.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((tx) => {
        const ref = doc(db, 'users', userId, 'transactions', tx.id);
        batch.set(ref, tx, { merge: true });
      });
      await batch.commit();
    }

    // 5. Batch write budgets
    if (data.budgets.length > 0) {
      const batch = writeBatch(db);
      data.budgets.forEach((b) => {
        const ref = doc(db, 'users', userId, 'budgets', b.categoryId);
        batch.set(ref, b, { merge: true });
      });
      await batch.commit();
    }

    // 6. Batch write debts
    if (data.debts.length > 0) {
      const batch = writeBatch(db);
      data.debts.forEach((d) => {
        const ref = doc(db, 'users', userId, 'debts', d.id);
        batch.set(ref, d, { merge: true });
      });
      await batch.commit();
    }

    localStorage.setItem('dhan_last_cloud_sync', new Date().toISOString());
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error during full cloud sync:', errorMsg);
    return { success: false, error: errorMsg };
  }
};

/**
 * Load all data for user from Firestore
 */
export const loadAllFromCloud = async (userId: string): Promise<CloudData | null> => {
  try {
    const [
      userSnap,
      accountsSnap,
      categoriesSnap,
      txSnap,
      budgetsSnap,
      debtsSnap,
    ] = await Promise.all([
      getDoc(doc(db, 'users', userId)),
      getDocs(collection(db, 'users', userId, 'accounts')),
      getDocs(collection(db, 'users', userId, 'categories')),
      getDocs(collection(db, 'users', userId, 'transactions')),
      getDocs(collection(db, 'users', userId, 'budgets')),
      getDocs(collection(db, 'users', userId, 'debts')),
    ]);

    const accounts: Account[] = [];
    accountsSnap.forEach((d) => accounts.push(d.data() as Account));

    const categories: Category[] = [];
    categoriesSnap.forEach((d) => categories.push(d.data() as Category));

    const transactions: Transaction[] = [];
    txSnap.forEach((d) => transactions.push(d.data() as Transaction));

    const budgets: Budget[] = [];
    budgetsSnap.forEach((d) => budgets.push(d.data() as Budget));

    const debts: DebtRecord[] = [];
    debtsSnap.forEach((d) => debts.push(d.data() as DebtRecord));

    const userData = userSnap.data();

    // If cloud has zero data at all, return null
    if (
      accounts.length === 0 &&
      transactions.length === 0 &&
      categories.length === 0 &&
      debts.length === 0
    ) {
      return null;
    }

    return {
      accounts,
      categories,
      transactions,
      budgets,
      debts,
      language: userData?.language,
    };
  } catch (error) {
    console.error('Failed to load data from cloud:', error);
    return null;
  }
};
