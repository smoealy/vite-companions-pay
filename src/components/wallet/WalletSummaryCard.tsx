
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from "@/contexts/UserContext";
import { getUserActivities } from '@/utils/firestoreService';

interface WalletSummaryCardProps {
  isLoading?: boolean;
}

const WalletSummaryCard: React.FC<WalletSummaryCardProps> = ({ isLoading = false }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalSaved: 0,
    totalRedeemed: 0,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const calculateStats = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get all user activities with no limit
        const activities = await getUserActivities(user.uid, 1000);
        
        let totalSaved = 0;
        let totalRedeemed = 0;
        
        // Calculate stats
        activities.forEach(activity => {
          if (activity.type === 'purchase' || activity.type === 'reward') {
            totalSaved += activity.amount;
          } else if (activity.type === 'redemption' || activity.type === 'card_load') {
            totalRedeemed += Math.abs(activity.amount);
          }
        });
        
        setStats({ totalSaved, totalRedeemed });
      } catch (error) {
        console.error("Error calculating wallet stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!isLoading) {
      calculateStats();
    }
  }, [user, isLoading]);

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-4">
        <h2 className="text-base font-medium text-cp-green-700 mb-3">Summary</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cp-green-50 rounded-lg p-3">
            <div className="text-xs text-cp-neutral-600 mb-1">Total Saved</div>
            {isLoading || loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-lg font-semibold text-cp-green-700">
                {stats.totalSaved.toLocaleString()} <span className="text-sm font-normal">IHRAM</span>
              </div>
            )}
          </div>
          
          <div className="bg-cp-neutral-50 rounded-lg p-3">
            <div className="text-xs text-cp-neutral-600 mb-1">Total Redeemed</div>
            {isLoading || loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-lg font-semibold text-cp-neutral-700">
                {stats.totalRedeemed.toLocaleString()} <span className="text-sm font-normal">IHRAM</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletSummaryCard;
