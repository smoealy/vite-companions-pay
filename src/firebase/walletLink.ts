
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export async function linkWalletToUser(uid: string, walletAddress: string) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { walletAddress }, { merge: true });
  return true;
}
