
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logTokenPurchase } from '@/firestore';
import { useAccount } from 'wagmi';

export function useFiatTokenPurchase() {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  
  // Handle Web2 fiat purchase flow
  const handleFiatPurchase = async (amount: string, paymentMethod: string) => {
    setLoading(true);
    
    // Log purchase to Firestore
    const purchaseData = {
      amountUsd: parseFloat(amount),
      tokenAmount: parseFloat(amount), // 1:1 ratio (1 USD = 1 IHRAM)
      timestamp: new Date(),
      paymentMethod: paymentMethod,
      status: 'pending',
      // If user is connected with wallet, associate with their address
      walletAddress: isConnected ? window.ethereum?.selectedAddress : null
    };
    
    try {
      await logTokenPurchase(purchaseData);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Purchase Successful!",
        description: `You've added ${parseFloat(amount).toLocaleString()} IHRAM tokens to your wallet.`,
        duration: 5000,
      });
      
      return true;
    } catch (error) {
      console.error("Error logging purchase:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleFiatPurchase,
    loading
  };
}
