
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import TokenBalanceCard from '@/components/dashboard/TokenBalanceCard';
import SavingsBalanceCard from '@/components/web2/SavingsBalanceCard';
import ProgressTrackerCard from '@/components/dashboard/ProgressTrackerCard';
import ServicesGrid from '@/components/dashboard/ServicesGrid';
import EarnTokensCard from '@/components/dashboard/EarnTokensCard';
import ActivityList from '@/components/dashboard/ActivityList';
import RewardNotification from '@/components/dashboard/RewardNotification';
import { useRewards } from '@/hooks/useRewards';
import { useUser } from '@/contexts/UserContext';
import { incrementBalance } from '@/utils/firestoreService';

const DashboardContent: React.FC = () => {
  const { 
    showRewardCard, 
    rewardAction, 
    rewardAmount,
    earnedToday,
    handleEarnReward,
    setEarnedToday
  } = useRewards();
  
  const { user, mode, userData, refreshUserData } = useUser();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Fetch and refresh user data on mount
  useEffect(() => {
    if (user) {
      refreshUserData();
    }
  }, [user, refreshUserData]);

  // Handle rewards in Web2 mode
  const handleEarnPoints = async (action: string, amount: number) => {
    if (!user) return;
    
    try {
      // Update user's balance in Firestore
      await incrementBalance(user.uid, amount);
      
      // Update the UI
      setEarnedToday((prev) => prev + amount);
      
      // Trigger the original reward handler for notification
      handleEarnReward(action, amount);
      
      // Refresh user data
      refreshUserData();
    } catch (error) {
      console.error("Error earning points:", error);
    }
  };
  
  return (
    <>
      {/* Floating reward notification */}
      <RewardNotification 
        show={showRewardCard}
        rewardAction={rewardAction}
        rewardAmount={rewardAmount}
      />
      
      {/* Main Content */}
      <div className="px-4 py-5 max-w-xl mx-auto w-full">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {/* Balance Card (Web2 or Web3 version) */}
          {mode === 'web3' ? (
            <TokenBalanceCard earnedToday={earnedToday} />
          ) : (
            <SavingsBalanceCard earnedToday={earnedToday} />
          )}
          
          {/* Progress Tracker */}
          <ProgressTrackerCard />

          {/* Services */}
          <ServicesGrid />

          {/* Earn More Section */}
          <EarnTokensCard 
            onEarnReward={mode === 'web2' ? handleEarnPoints : handleEarnReward} 
          />

          {/* Recent Activity */}
          <ActivityList earnedToday={earnedToday} />
        </motion.div>
      </div>
    </>
  );
};

export default DashboardContent;
