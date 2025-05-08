// File: src/components/dashboard/DashboardContent.tsx
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
import { useUser } from "@/contexts/UserContext";
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

  // 🔄 Refresh user data when user or earnedToday changes
  useEffect(() => {
    if (user) {
      refreshUserData();
    }
  }, [user, refreshUserData, earnedToday]);

  // 🔄 Patch for mobile wallet not updating balance on first load
  useEffect(() => {
    if (mode === 'web3') {
      const timeout = setTimeout(() => {
        refreshUserData();
      }, 2500); // slight delay to ensure wallet provider injection completes
      return () => clearTimeout(timeout);
    }
  }, [mode, refreshUserData]);

  // 🎁 Handle reward earnings in Web2 mode
  const handleEarnPoints = async (action: string, amount: number) => {
    if (!user) return;

    try {
      await incrementBalance(user.uid, amount);
      setEarnedToday((prev) => prev + amount);
      handleEarnReward(action, amount);
      await refreshUserData();
    } catch (error) {
      console.error("Error earning points:", error);
    }
  };

  return (
    <>
      {/* 🎉 Reward Notification */}
      <RewardNotification
        show={showRewardCard}
        rewardAction={rewardAction}
        rewardAmount={rewardAmount}
      />

      {/* 🧾 Main Dashboard Content */}
      <div className="px-4 py-5 max-w-xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {/* 💰 Balance Card */}
          {mode === 'web3' ? (
            <TokenBalanceCard earnedToday={earnedToday} />
          ) : (
            <SavingsBalanceCard earnedToday={earnedToday} />
          )}

          {/* 📊 Progress Toward Goal */}
          <ProgressTrackerCard />

          {/* 🧭 Services Grid */}
          <ServicesGrid />

          {/* 🎯 Earn Rewards */}
          <EarnTokensCard
            onEarnReward={mode === 'web2' ? handleEarnPoints : handleEarnReward}
          />

          {/* 🕘 Activity Log */}
          <ActivityList earnedToday={earnedToday} />
        </motion.div>
      </div>
    </>
  );
};

export default DashboardContent;
