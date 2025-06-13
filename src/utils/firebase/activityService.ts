
import { db } from '@/firebaseConfig';
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where, 
  orderBy, 
  limit,
  getDocs
} from 'firebase/firestore';

export type ActivityType = 'redemption' | 'donation' | 'reward' | 'purchase' | 'card_load';

export interface ActivityLog {
  uid: string;
  type: ActivityType;
  amount: number;
  timestamp: Date | any; // Firebase Timestamp or JS Date
  description?: string;
  metadata?: Record<string, any>;
}

export const logActivity = async (data: ActivityLog): Promise<void> => {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      ...data,
      timestamp: data.timestamp || Timestamp.now()
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
};

export const getUserActivities = async (uid: string, maxResults = 10) => {
  try {
    const activitiesRef = collection(db, 'activity_logs');
    const activitiesQuery = query(
      activitiesRef,
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(activitiesQuery);
    const activities: Array<ActivityLog & { id: string }> = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...(doc.data() as ActivityLog)
      });
    });
    
    return activities;
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return [];
  }
};

export const logAdminAction = async (adminUid: string, action: string, details: any) => {
  try {
    await addDoc(collection(db, 'admin_logs'), {
      adminUid,
      action,
      details,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error("Error logging admin action:", error);
    throw error;
  }
};
