
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface RewardNotificationProps {
  show: boolean;
  rewardAction: string;
  rewardAmount: number;
}

const RewardNotification: React.FC<RewardNotificationProps> = ({
  show,
  rewardAction,
  rewardAmount
}) => {
  if (!show) return null;
  
  return (
    <motion.div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white p-4 rounded-lg shadow-lg border border-cp-gold-200"
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-2">
        <Star className="text-cp-gold-500 h-6 w-6 animate-pulse" />
        <h3 className="font-medium text-cp-green-700">Reward Earned!</h3>
        <div className="text-center">
          <p className="text-xs text-cp-neutral-600">{rewardAction}</p>
          <p className="text-base font-bold text-cp-gold-600">+{rewardAmount} IHRAM</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RewardNotification;
