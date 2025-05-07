
import { useState } from 'react';
import { auth } from '@/firebaseConfig';
import { logFeedbackReward } from '@/firestore';
import { useToast } from '@/hooks/use-toast';

export const useRewards = () => {
  const { toast } = useToast();
  
  // State for reward notifications
  const [showRewardCard, setShowRewardCard] = useState(false);
  const [rewardAction, setRewardAction] = useState<string>('');
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [earnedToday, setEarnedToday] = useState<number>(0);
  
  // Handle earning rewards
  const handleEarnReward = async (action: string, amount: number, rewardType: string = 'reward') => {
    setRewardAction(action);
    setRewardAmount(amount);
    setShowRewardCard(true);
    
    // Log the reward to Firestore
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await logFeedbackReward({
          userId: currentUser.uid,
          timestamp: new Date().toISOString(),
          amount: amount,
          type: rewardType
        });
      }
    } catch (error) {
      console.error("Error logging feedback reward:", error);
      toast({
        title: "Error",
        description: "Unable to log reward activity",
        variant: "destructive"
      });
    }
    
    // Hide reward card after 4 seconds
    setTimeout(() => {
      setShowRewardCard(false);
      // Update token balance
      setEarnedToday(prev => prev + amount);
    }, 4000);
  };
  
  return {
    showRewardCard,
    rewardAction,
    rewardAmount,
    earnedToday,
    handleEarnReward,
    setEarnedToday // Expose setEarnedToday to components
  };
};
