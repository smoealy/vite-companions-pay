
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Coins, RefreshCcw } from 'lucide-react';
import TokenDisplay from '@/components/ui-components/TokenDisplay';
import { useAccount } from 'wagmi';
import { useEthersTokenBalance } from '@/hooks/useEthersTokenBalance';
import { useToast } from '@/hooks/use-toast';

interface TokenBalanceCardProps {
  earnedToday: number;
}

const TokenBalanceCard: React.FC<TokenBalanceCardProps> = ({ earnedToday }) => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { balance, isLoading: isLoadingBalance, refreshBalance } = useEthersTokenBalance();
  const { toast } = useToast();
  
  const handleRefreshBalance = () => {
    refreshBalance();
    toast({
      title: "Refreshing Balance",
      description: "Updating your token balance..."
    });
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div variants={itemVariants}>
      <div className="bg-gradient-to-br from-cp-green-500 to-cp-green-700 rounded-xl shadow p-5 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTMwLDMwIEw2MCwzMCBNMzAsMzAgTDMwLDYwIE0zMCwzMCBMMCwzMCBNMzAsMzAgTDMwLDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] bg-repeat"></div>
        <TokenDisplay 
          amount={parseFloat(balance)} 
          size="lg" 
          className="text-white" 
          showEarnedToday={earnedToday > 0} 
          earnedToday={earnedToday} 
        />
        <div className="flex justify-center gap-3 mt-4">
          {!isConnected ? (
            <Button 
              onClick={() => navigate('/test')}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-lg"
            >
              Connect Wallet
            </Button>
          ) : (
            <Button
              onClick={handleRefreshBalance}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-lg"
              disabled={isLoadingBalance}
            >
              <RefreshCcw className={`mr-1.5 h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
              {isLoadingBalance ? 'Loading...' : 'Refresh'}
            </Button>
          )}
          <Button 
            onClick={() => navigate('/buy-tokens')}
            className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-lg"
          >
            <Coins className="mr-1.5 h-4 w-4" />
            Buy Tokens
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TokenBalanceCard;
