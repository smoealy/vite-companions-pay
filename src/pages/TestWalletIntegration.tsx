
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '../walletConnect';
import { getIHRAMBalance } from '../web3/tokenUtils';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestWalletIntegration() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Try to get balance automatically when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      checkBalance();
    }
  }, [isConnected, address]);

  async function checkBalance() {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Checking balance for:", address);
      const balanceResult = await getIHRAMBalance(address as string);
      console.log("Balance result:", balanceResult);
      setBalance(balanceResult);
      toast({
        title: "Balance retrieved",
        description: `Your IHRAM Balance: ${balanceResult}`
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast({
        title: "Error",
        description: "Could not retrieve your IHRAM balance",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cp-cream to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-cp-neutral-700 mr-2"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft size={24} />
          </Button>
          <h1 className="text-xl font-semibold text-cp-green-700">
            Test Wallet Integration
          </h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-cp-neutral-100 p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-center">Connect Your Wallet</h2>
          
          <div className="flex justify-center mb-6">
            <ConnectButton />
          </div>
          
          <div className="space-y-6">
            {isConnected ? (
              <>
                <div className="p-4 bg-cp-neutral-50 rounded-lg">
                  <p className="text-sm text-cp-neutral-600 mb-1">Connected Address:</p>
                  <p className="font-mono text-xs break-all">{address}</p>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  <Button
                    onClick={checkBalance}
                    className="w-full bg-cp-green-600 hover:bg-cp-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Checking..." : "Check IHRAM Balance"}
                  </Button>
                  
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg w-full">
                      <p className="text-sm text-red-800 mb-1">Error:</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  
                  {balance !== null && (
                    <div className="p-4 bg-cp-green-50 border border-cp-green-100 rounded-lg w-full text-center">
                      <p className="text-sm text-cp-green-800 mb-1">Your IHRAM Balance:</p>
                      <p className="font-semibold text-lg">{balance} IHRAM</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-cp-neutral-600">
                Connect your wallet to check your IHRAM token balance
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
