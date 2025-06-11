import { db } from '@/firebaseConfig';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// ✅ Get user data
export const getUserData = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

// ✅ Update user data
export const updateUserData = async (uid: string, data: any) => {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
};

// ✅ Corrected: Increment IC Balance (not legacy `balance`)
export const incrementBalance = async (uid: string, amount: number) => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    const currentBalance = data.icBalance ?? data.balance ?? 0;

    const newBalance = currentBalance + amount;
    const transactions = data.icTransactions || [];

    transactions.unshift({
      type: 'reward',
      amount,
      timestamp: new Date().toISOString()
    });

    await updateDoc(userRef, {
      icBalance: newBalance,
      icTransactions: transactions
    });

    return newBalance;
  }

  return 0;
};

// ✅ Get all admin users
export const getAdminUsers = async () => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('isAdmin', '==', true));

  const querySnapshot = await getDocs(q);
  const adminUsers: Array<any> = [];

  querySnapshot.forEach((doc) => {
    adminUsers.push({
      uid: doc.id,
      ...doc.data()
    });
  });

  return adminUsers;
};
