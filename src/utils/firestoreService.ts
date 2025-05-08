// This file now just re-exports everything from the refactored modules
// to maintain backward compatibility with existing imports

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

// ✅ NEW: Import firebase directly to fetch icTransactions and update user profile
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ✅ NEW: Define IC activity types
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

// ✅ NEW: Get IC top-ups directly from Firestore
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

// ✅ NEW: Update user profile fields (name, country, phone)
export const updateUserProfile = async (
  uid: string | undefined,
  data: Partial<{ name: string; country: string; phone: string }>
): Promise<void> => {
  if (!uid) throw new Error("UID is required to update profile");
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, data, { merge: true });
};

// 🔁 Re-export types
export type { UmrahRedemptionData } from './firebase/redemptionService';
export type { ActivityLog as LoggedActivity, ActivityType as LoggedActivityType } from './firebase/activityService';

// 🔁 Re-export all other services (without duplicating getICTransactions)
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
