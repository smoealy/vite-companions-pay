
import { useNavigate } from 'react-router-dom';
import { useEthersTokenBalance } from '@/hooks/useEthersTokenBalance';
import { useFiatTokenPurchase } from '@/hooks/useFiatTokenPurchase';
import { useWeb3TokenPurchase } from '@/hooks/useWeb3TokenPurchase';
import { getTokenAmount } from '@/lib/tokenSaleConstants';

export function useBuyTokens() {
  const navigate = useNavigate();
  const { refreshBalance } = useEthersTokenBalance();
  const { handleFiatPurchase, loading } = useFiatTokenPurchase();
  const { handleWeb3Purchase, processingWeb3, fetchCurrentRate, currentRate } = useWeb3TokenPurchase(refreshBalance);

  // Handle Web2 fiat purchase flow with navigation
  const handleFiatPurchaseWithNavigation = async (amount: string, paymentMethod: string) => {
    const success = await handleFiatPurchase(amount, paymentMethod);
    if (success) {
      navigate('/dashboard');
    }
  };

  // Handle Web3 direct token purchase with navigation
  const handleWeb3PurchaseWithNavigation = async (amount: string) => {
    const success = await handleWeb3Purchase(amount);
    if (success) {
      navigate('/dashboard');
    }
  };

  return {
    getTokenAmount,
    handleFiatPurchase: handleFiatPurchaseWithNavigation,
    handleWeb3Purchase: handleWeb3PurchaseWithNavigation,
    fetchCurrentRate,
    currentRate,
    loading,
    processingWeb3
  };
}
