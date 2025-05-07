
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

// Re-export types with proper TypeScript export syntax
export type { UmrahRedemptionData } from './firebase/redemptionService';
export type { ActivityType, ActivityLog } from './firebase/activityService';

// Re-export everything else to maintain backward compatibility
export {
  // User operations
  getUserData,
  updateUserData,
  incrementBalance,
  getAdminUsers,
  
  // Umrah redemption operations
  submitUmrahRedemption,
  getUmrahRedemptions,
  updateRedemptionStatus,
  getRedemptionStats,
  
  // Activity logging
  logActivity,
  getUserActivities,
  logAdminAction
};
