import { getDoc, getDocs, doc, setDoc, updateDoc, collection, onSnapshot, query } from 'firebase/firestore';
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
  getRedemptionStats
} from './firebase/redemptionService';

import {
  logActivity,
  getUserActivities,
  logAdminAction
} from './firebase/activityService';

// ✅ IC Activity Types
export type ActivityType = 
  | 'paypal'
  | 'reward'
  | 'redemption'
  | 'donation'
  | 'card_load'
  | 'purchase';

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
  return userSnap.data().icBalance || 0;
};

// ✅ Deduct IC (Used during redemption)
export const deductICBalance = async (uid: string, amount: number): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) throw new Error('User not found');

  const currentBalance = userSnap.data().icBalance || 0;
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

  await updateDoc(userRef, {
    icTransactions: txs
  });
};

// ✅ Get IC Transaction History
export const getICTransactions = async (
  uid: string,
  limit: number = 10
): Promise<Array<ActivityLog & { id: string }>> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return [];

  const data = userSnap.data();
  const txs = (data.icTransactions || []) as ActivityLog[];

  return txs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
    .map((tx, index) => ({
      ...tx,
      id: index.toString()
    }));
};

// ✅ Update User Profile Info
export const updateUserProfile = async (
  uid: string | undefined,
  data: Partial<{ name: string; country: string; phone: string }>
): Promise<void> => {
  if (!uid) throw new Error("UID is required to update profile");
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, data, { merge: true });
};

// ✅ Get All Users With IC Balances
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

  const users: Array<{
    id: string;
    email?: string;
    wallet?: string;
    role?: string;
    createdAt?: any;
    balance: number;
  }> = [];

  querySnap.forEach((docSnap) => {
    const data = docSnap.data();
    users.push({
      id: docSnap.id,
      email: data.email || '',
      wallet: data.walletAddress || '',
      role: data.role || 'user',
      createdAt: data.createdAt || null,
      balance: data.icBalance || 0
    });
  });

  return users;
};

// ✅ Listen to Token Purchases in Real-Time
export const listenToTokenPurchases = (
  callback: (data: any[]) => void
): (() => void) => {
  const q = query(collection(db, 'tokenPurchases'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const purchases = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(purchases);
  });

  return unsubscribe;
};

// 🔁 Re-export types
export type { UmrahRedemptionData } from './firebase/redemptionService';
export type { ActivityLog as LoggedActivity, ActivityType as LoggedActivityType } from './firebase/activityService';

// 🔁 Re-export all other services
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
