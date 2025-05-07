import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/contexts/UserContext';
import { getUserActivities, ActivityLog } from '@/utils/firestoreService';

interface ActivityListProps {
  earnedToday: number;
}

const ActivityList: React.FC<ActivityListProps> = ({ earnedToday }) => {
  const { user } = useUser();
  const [activities, setActivities] = useState<Array<ActivityLog & { id: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const userActivities = await getUserActivities(user.uid);
        setActivities(userActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    // Firebase timestamp handling
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // If today, return "Today"
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }
    
    // Otherwise return formatted date
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-4">
        <h2 className="text-base font-medium text-cp-green-700 mb-3 flex items-center">
          <ArrowUpDown className="h-4 w-4 mr-1.5 text-cp-green-600" />
          Recent Activity
        </h2>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center border-b border-cp-neutral-100 pb-3">
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-2.5">
            {earnedToday > 0 && (
              <motion.div 
                className="flex justify-between items-center border-b border-cp-neutral-100 pb-2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div>
                  <div className="text-sm text-cp-neutral-800">Savings Points Rewards</div>
                  <div className="text-xs text-cp-neutral-500">Today</div>
                </div>
                <div className="text-cp-green-700 font-medium text-sm">+{earnedToday} points</div>
              </motion.div>
            )}
            
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex justify-between items-center border-b border-cp-neutral-100 pb-2.5"
              >
                <div>
                  <div className="text-sm text-cp-neutral-800">
                    {activity.type === 'purchase' && 'Purchase'}
                    {activity.type === 'reward' && 'Reward'}
                    {activity.type === 'redemption' && 'Umrah Package Reservation'}
                    {activity.type === 'donation' && 'Donation'}
                    {activity.type === 'card_load' && 'Card Load'}
                  </div>
                  <div className="text-xs text-cp-neutral-500">{formatDate(activity.timestamp)}</div>
                </div>
                <div className={`font-medium text-sm ${activity.amount >= 0 ? 'text-cp-green-700' : 'text-cp-neutral-700'}`}>
                  {activity.amount >= 0 ? '+' : ''}{activity.amount.toLocaleString()} points
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-cp-neutral-500">
            <p>No activity yet</p>
            <p className="text-sm mt-1">Complete actions to earn savings points</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityList;
