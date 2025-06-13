import { db } from '@/firebaseConfig';
import { collection, addDoc, serverTimestamp, onSnapshot, query } from 'firebase/firestore';

export type ImpactAction = 'tree' | 'water' | 'quran' | 'wheelchair' | 'badal' | 'qurbani';

export interface ImpactLog {
  userId: string;
  action: ImpactAction;
  amount: number;
  timestamp?: any;
  email?: string | null;
}

export const logImpactAction = async (data: ImpactLog) => {
  await addDoc(collection(db, 'impact_logs'), {
    ...data,
    timestamp: data.timestamp || serverTimestamp()
  });
};

export const listenToImpactLogs = (
  callback: (logs: Array<ImpactLog & { id: string }>) => void
): (() => void) => {
  const q = query(collection(db, 'impact_logs'));
  return onSnapshot(q, snapshot => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<ImpactLog & { id: string }>;
    const sorted = logs.sort((a,b) => {
      const da = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dbt = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dbt.getTime() - da.getTime();
    });
    callback(sorted);
  });
};
