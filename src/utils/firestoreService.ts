import {
  getDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

import {
  getUserData,
  updateUserData,
  incrementBalance,
  getAdminUsers
} from './firebase/userService';

import {
  submitUmrahRedemption,
  getUmrahRedemptions,
  updateRedemptionStatus,
  getRedemptionStats,
  UmrahRedemptionData
} from './firebase/redemptionService';

import {
  logActivity,
  getUserActivities,
  logAdminAction,
  ActivityLog as LoggedActivity,
  ActivityType as LoggedActivityType
} from './firebase/activityService';

export type ActivityType =
  | 'paypal'
  | 'reward'
  | 'redemption'
  | 'donation'
  | 'card_load'
  | 'purchase'
  | 'transfer'
  | 'gift'
  | 'ic_to_it'
  | 'withdrawal';

export interface ActivityLog {
  type: ActivityType;
  amount: number;
  timestamp: string;
}

// ✅ Get IC Balance
export const getICBalance = async (uid: string): Promise<number> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return 0;

  const data = userSnap.data();
  return data.icBalance ?? data.balance ?? 0;
};

// ✅ Deduct IC
export const deductICBalance = async (uid: string, amount: number): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('User not found');
  const currentBalance = userSnap.data().icBalance ?? userSnap.data().balance ?? 0;
  if (amount > currentBalance) throw new Error('Insufficient balance');

  await updateDoc(userRef, {
    icBalance: currentBalance - amount
  });

  const txs = userSnap.data().icTransactions || [];
  txs.unshift({
    type: 'redemption',
    amount: -amount,
    timestamp: new Date().toISOString()
  });
  await updateDoc(userRef, { icTransactions: txs });
};

// ✅ Add Custom IC Transaction
export const addICTransaction = async (
  uid: string,
  type: ActivityType,
  amount: number
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('User not found');
  const currentBalance = userSnap.data().icBalance ?? userSnap.data().balance ?? 0;

  const isNegative = ['withdrawal', 'redemption', 'transfer'].includes(type);
  const updatedBalance = isNegative ? currentBalance - amount : currentBalance + amount;
  if (updatedBalance < 0) throw new Error('Insufficient balance');

  const txs = userSnap.data().icTransactions || [];
  txs.unshift({
    type,
    amount: isNegative ? -amount : amount,
    timestamp: new Date().toISOString()
  });

  await updateDoc(userRef, {
    icBalance: updatedBalance,
    icTransactions: txs
  });
};

// ✅ Get Transactions for a User
export const getICTransactions = async (
  uid: string,
  limit: number = 10
): Promise<Array<ActivityLog & { id: string }>> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return [];
  const txs = (userSnap.data().icTransactions || []) as ActivityLog[];

  return txs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
    .map((tx, index) => ({
      ...tx,
      id: index.toString()
    }));
};

// ✅ Get All User Activity Logs
export const getAllUserActivityLogs = async (): Promise<
  Array<ActivityLog & { id: string; userId: string; email: string }>
> => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  const logs: Array<ActivityLog & { id: string; userId: string; email: string }> = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const txs = data.icTransactions || [];
    txs.forEach((tx: ActivityLog, i: number) => {
      logs.push({
        ...tx,
        id: `${docSnap.id}-${i}`,
        userId: docSnap.id,
        email: data.email || '—'
      });
    });
  });

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ✅ Update Profile
export const updateUserProfile = async (
  uid: string | undefined,
  data: Partial<{ name: string; country: string; phone: string }>
): Promise<void> => {
  if (!uid) throw new Error("UID is required to update profile");
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, data, { merge: true });
};

// ✅ Get All Users With Balances
export const getAllUsersWithBalances = async (): Promise<
  Array<{
    id: string;
    email?: string;
    wallet?: string;
    role?: string;
    createdAt?: any;
    balance: number;
  }>
> => {
  const usersRef = collection(db, 'users');
  const querySnap = await getDocs(usersRef);
  return querySnap.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      email: data.email || '',
      wallet: data.walletAddress || '',
      role: data.role || 'user',
      createdAt: data.createdAt || null,
      balance: data.icBalance ?? data.balance ?? 0
    };
  });
};

// ✅ Listen to Token Purchases
export const listenToTokenPurchases = (
  callback: (data: any[]) => void
): (() => void) => {
  const q = query(collection(db, 'tokenPurchases'));
  return onSnapshot(q, (snapshot) => {
    const purchases = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(purchases);
  });
};

// ✅ Listen to Redemptions (Fixed: sorted & typed)
export const listenToRedemptions = (
  callback: (data: Array<UmrahRedemptionData & { id: string }>) => void
): (() => void) => {
  const q = query(collection(db, 'redemptions'));
  return onSnapshot(q, (snapshot) => {
    const redemptions = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<UmrahRedemptionData & { id: string }>;

    const sorted = redemptions.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    callback(sorted);
  });
};

// 🔁 Re-export Types
export type { UmrahRedemptionData };
export type { LoggedActivity, LoggedActivityType };

// 🔁 Re-export All Services
export {
  getUserData,
  updateUserData,
  incrementBalance,
  getAdminUsers,
  submitUmrahRedemption,
  getUmrahRedemptions,
  updateRedemptionStatus,
  getRedemptionStats,
  logActivity,
  getUserActivities,
  logAdminAction
};
