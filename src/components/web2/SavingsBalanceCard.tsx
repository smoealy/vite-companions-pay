
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCcw, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { Skeleton } from '@/components/ui/skeleton';

interface SavingsBalanceCardProps {
  earnedToday: number;
}

const SavingsBalanceCard: React.FC<SavingsBalanceCardProps> = ({ earnedToday }) => {
  const navigate = useNavigate();
  const { userData, refreshUserData } = useUser();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { toast } = useToast();
  
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshUserData();
      toast({
        title: "Balance Refreshed",
        description: "Your savings balance has been updated.",
      });
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast({
        title: "Error",
        description: "Failed to refresh your balance.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const balance = userData?.balance || 0;
  
  return (
    <motion.div variants={itemVariants}>
      <div className="bg-gradient-to-br from-cp-green-500 to-cp-green-700 rounded-xl shadow p-5 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTMwLDMwIEw2MCwzMCBNMzAsMzAgTDMwLDYwIE0zMCwzMCBMMCwzMCBNMzAsMzAgTDMwLDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] bg-repeat"></div>
        
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-90">My Savings Balance</h2>
        
        <div className="flex items-center justify-center mb-1">
          {earnedToday > 0 && (
            <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full mr-2">
              +{earnedToday} today
            </div>
          )}
        </div>
        
        <div className="text-4xl font-bold mb-1">
          {isLoading ? (
            <div className="h-10 w-24 bg-white/20 animate-pulse rounded mx-auto"></div>
          ) : (
            balance.toLocaleString()
          )}
        </div>
        
        <div className="text-sm opacity-80 mb-4">Savings Points</div>
        
        <div className="flex justify-center gap-3">
          <Button
            onClick={handleRefresh}
            className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-lg"
            disabled={isLoading}
          >
            <RefreshCcw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          
          <Button 
            onClick={() => navigate('/wallet')}
            className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-lg"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Add Funds
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SavingsBalanceCard;
