
import { db } from '@/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type ActivityType = 'redemption' | 'donation' | 'reward' | 'purchase' | 'card_load';

interface ActivityLogData {
  uid: string;
  type: ActivityType;
  amount: number;
  metadata?: Record<string, any>;
}

export const logActivity = async (data: ActivityLogData): Promise<void> => {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      ...data,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
};

export const fetchUserActivities = async (uid: string, limit = 10) => {
  // This would be implemented later when we add activity list functionality
  // It would use Firebase query to get the user's activities sorted by timestamp
  return [];
};
