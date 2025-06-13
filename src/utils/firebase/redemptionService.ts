
import { db } from '@/firebaseConfig';
import { 
  collection, 
  doc,
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';

export interface UmrahRedemptionData {
  userId: string;
  userEmail: string | null;
  tier: string;
  tokenAmount: number;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'completed' | 'cancelled';
  formData: {
    name: string;
    email: string;
    country: string;
    arrival: string;
    makkahNights: number;
    madinahNights: number;
    [key: string]: any;
  };
  fileURL?: string | null; // Add fileURL property to support passport/photo uploads
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
}

export const submitUmrahRedemption = async (data: Omit<UmrahRedemptionData, 'status'>) => {
  // Create a submission with pending status
  const submissionData = {
    ...data,
    status: 'pending' as const,
    createdAt: Timestamp.now()
  };
  
  // Create document with user ID path
  const redemptionsRef = collection(db, 'redemptions');
  const docRef = await addDoc(redemptionsRef, submissionData);
  
  return docRef.id;
};

export const getUmrahRedemptions = async (filters?: {
  userId?: string;
  status?: UmrahRedemptionData['status'];
  country?: string;
  search?: string;
  maxResults?: number;
}) => {
  let q = collection(db, 'redemptions');
  let constraints = [];
  
  if (filters?.userId) {
    constraints.push(where('userId', '==', filters.userId));
  }
  
  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }
  
  if (filters?.country) {
    constraints.push(where('formData.country', '==', filters.country));
  }
  
  // Default ordering by timestamp descending (newest first)
  constraints.push(orderBy('createdAt', 'desc'));
  
  if (filters?.maxResults) {
    constraints.push(limit(filters.maxResults));
  }
  
  const querySnapshot = await getDocs(query(q, ...constraints));
  const redemptions: Array<UmrahRedemptionData & { id: string }> = [];
  
  querySnapshot.forEach((doc) => {
    redemptions.push({
      id: doc.id,
      ...doc.data() as UmrahRedemptionData
    });
  });
  
  // Apply client-side search filter if provided
  if (filters?.search && filters.search.trim() !== '') {
    const searchLower = filters.search.toLowerCase();
    return redemptions.filter(r => 
      r.formData.name?.toLowerCase().includes(searchLower) ||
      r.formData.email?.toLowerCase().includes(searchLower) ||
      r.formData.country?.toLowerCase().includes(searchLower)
    );
  }
  
  return redemptions;
};

export const updateRedemptionStatus = async (
  redemptionId: string, 
  status: UmrahRedemptionData['status'],
  adminData?: { 
    adminId: string; 
    notes?: string;
  }
) => {
  const redemptionRef = doc(db, 'redemptions', redemptionId);
  
  const updateData: Record<string, any> = { status };
  
  if (adminData) {
    updateData.reviewedBy = adminData.adminId;
    updateData.reviewedAt = Timestamp.now();
    
    if (adminData.notes) {
      updateData.adminNotes = adminData.notes;
    }
  }
  
  await updateDoc(redemptionRef, updateData);
};

// Get summary statistics for admin dashboard
export const getRedemptionStats = async () => {
  const q = collection(db, 'redemptions');
  const querySnapshot = await getDocs(q);
  
  const stats = {
    total: 0,
    pending: 0,
    reviewed: 0,
    contacted: 0,
    completed: 0,
    cancelled: 0,
    bronze: 0,
    silver: 0,
    gold: 0
  };
  
  querySnapshot.forEach((doc) => {
    const data = doc.data() as UmrahRedemptionData;
    stats.total++;
    
    // Count by status
    if (data.status) {
      stats[data.status]++;
    }
    
    // Count by tier
    if (data.tier) {
      stats[data.tier as 'bronze' | 'silver' | 'gold']++;
    }
  });
  
  return stats;
};
