
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, ArrowDown, History, Coins, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import TokenDisplay from '@/components/ui-components/TokenDisplay';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import WalletSummaryCard from '@/components/wallet/WalletSummaryCard';
import TopUpModal from '@/components/wallet/TopUpModal';
import Footer from '@/components/ui-components/Footer';
import { useToast } from '@/hooks/use-toast';

const Wallet = () => {
  const navigate = useNavigate();
  const { userData, mode, refreshUserData } = useUser();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Check for success param from Stripe checkout redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast({
        title: "Payment Successful",
        description: "Your tokens have been added to your account",
        variant: "default",
      });
      refreshUserData();
      
      // Clean up URL params
      navigate('/wallet', { replace: true });
    } else if (canceled === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your payment was not processed",
        variant: "destructive",
      });
      
      // Clean up URL params
      navigate('/wallet', { replace: true });
    }
  }, [searchParams, toast, navigate, refreshUserData]);
  
  const balance = userData?.balance || 0;
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-cp-cream/30">
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
            IHRAM Wallet
          </h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow p-4 max-w-xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Balance Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-cp-green-500 to-cp-green-700 text-white overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center">
              <TokenDisplay 
                amount={balance} 
                size="lg" 
                className="text-white py-4" 
              />
              
              <div className="mt-4 flex gap-3">
                <Button
                  className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-lg"
                  onClick={() => setIsTopUpModalOpen(true)}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Top Up Balance
                </Button>
                <Button
                  className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-lg"
                  onClick={() => navigate('/redeem')}
                >
                  <ArrowDown className="mr-1.5 h-4 w-4" />
                  Redeem
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Summary Card */}
          <WalletSummaryCard isLoading={isLoading} />
          
          {/* Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium text-cp-green-700 flex items-center">
                <History className="h-4 w-4 mr-1.5 text-cp-green-600" />
                Transaction History
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs text-cp-green-600"
                onClick={() => navigate('/wallet/transactions')}
              >
                View All
              </Button>
            </div>
            <TransactionHistory isLoading={isLoading} limit={5} />
          </div>
          
          {/* Services */}
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4">
              <h2 className="text-base font-medium text-cp-green-700 mb-3 flex items-center">
                <Coins className="h-4 w-4 mr-1.5 text-cp-green-600" />
                Services
              </h2>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline" 
                  className="justify-start text-cp-neutral-700 h-auto py-3"
                  onClick={() => navigate('/card')}
                >
                  <div className="flex flex-col items-start">
                    <span>Card Load</span>
                    <span className="text-xs text-cp-neutral-500">Load your Companions Card</span>
                  </div>
                </Button>
                <Button
                  variant="outline" 
                  className="justify-start text-cp-neutral-700 h-auto py-3"
                  onClick={() => navigate('/buy-tokens')}
                >
                  <div className="flex flex-col items-start">
                    <span>Buy Tokens</span>
                    <span className="text-xs text-cp-neutral-500">Purchase IHRAM tokens</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Top Up Modal */}
      <TopUpModal
        open={isTopUpModalOpen}
        onOpenChange={setIsTopUpModalOpen}
      />
    </div>
  );
};

export default Wallet;
