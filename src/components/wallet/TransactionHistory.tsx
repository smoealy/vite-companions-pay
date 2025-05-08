import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from "../../../contexts/UserContext";
import { getICTransactions, ActivityType, ActivityLog } from '@/utils/firestoreService';

interface TransactionHistoryProps {
  isLoading?: boolean;
  limit?: number;
  className?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  isLoading = false, 
  limit = 10,
  className = ''
}) => {
  const { user } = useUser();
  const [activities, setActivities] = useState<Array<ActivityLog & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const userActivities = await getICTransactions(user.uid, limit);
        setActivities(userActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchActivities();
    }
  }, [user, isLoading, limit]);

  const getTransactionIcon = (type: ActivityType) => {
    switch (type) {
      case 'purchase':
        return '💰';
      case 'redemption':
        return '🕋';
      case 'reward':
        return '🎁';
      case 'donation':
        return '❤️';
      case 'card_load':
        return '💳';
      case 'paypal':
        return '🟢';
      default:
        return '📝';
    }
  };

  const getTransactionName = (type: ActivityType) => {
    switch (type) {
      case 'purchase':
        return 'Token Purchase';
      case 'redemption':
        return 'Umrah Package Redemption';
      case 'reward':
        return 'Reward Earned';
      case 'donation':
        return 'Donation';
      case 'card_load':
        return 'Card Load';
      case 'paypal':
        return 'Top-Up via PayPal';
      default:
        return 'Transaction';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (isLoading || loading) {
    return (
      <Card className={`border-none shadow-sm bg-white ${className}`}>
        <div className="p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 border-b border-cp-neutral-100 py-3 last:border-0">
              <div className="h-8 w-8 bg-cp-neutral-100 rounded-full flex items-center justify-center">
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={`border-none shadow-sm bg-white ${className}`}>
        <div className="p-6 text-center text-cp-neutral-500">
          <p>No transactions yet</p>
          <p className="text-sm mt-1">Your transaction history will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`border-none shadow-sm bg-white ${className}`}>
      <div className="divide-y divide-cp-neutral-100">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 p-3">
            <div className="h-8 w-8 bg-cp-neutral-50 rounded-full flex items-center justify-center">
              <span role="img" aria-label={activity.type}>
                {getTransactionIcon(activity.type)}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-cp-neutral-800">
                {getTransactionName(activity.type)}
              </div>
              <div className="text-xs text-cp-neutral-500">
                {formatDate(activity.timestamp)}
              </div>
            </div>
            <div className={`font-medium text-sm ${activity.amount >= 0 ? 'text-cp-green-700' : 'text-cp-neutral-700'}`}>
              {activity.amount >= 0 ? '+' : ''}{activity.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TransactionHistory;
