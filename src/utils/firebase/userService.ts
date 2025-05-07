
import { db } from '@/firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc
} from 'firebase/firestore';

// User related operations
export const getUserData = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

export const updateUserData = async (uid: string, data: any) => {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
};

export const incrementBalance = async (uid: string, amount: number) => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const currentBalance = userDoc.data().balance || 0;
    await updateDoc(userRef, {
      balance: currentBalance + amount
    });
    return currentBalance + amount;
  }
  
  return 0;
};

// Get all admin users
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

import { collection, query, where, getDocs } from 'firebase/firestore';
