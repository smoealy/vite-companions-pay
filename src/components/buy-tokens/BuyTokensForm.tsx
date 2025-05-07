
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useBuyTokens } from '@/hooks/useBuyTokens';
import { useEthersTokenBalance } from '@/hooks/useEthersTokenBalance';
import TokenAmountSelector from './TokenAmountSelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import PurchaseButton from './PurchaseButton';
import ComplianceNotice from './ComplianceNotice';
import { MIN_CONTRIBUTION_ETH } from '@/lib/tokenSaleConstants'; 
import { Info } from 'lucide-react';
import { ethers } from 'ethers';

const BuyTokensForm = () => {
  const { isConnected } = useAccount();
  const { balance } = useEthersTokenBalance();
  const [amount, setAmount] = useState<string>('0.05');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [amountTooLow, setAmountTooLow] = useState<boolean>(false);
  const [tokenRate, setTokenRate] = useState<number>(0);
  
  const { 
    getTokenAmount, 
    handleFiatPurchase, 
    handleWeb3Purchase, 
    loading, 
    processingWeb3,
    fetchCurrentRate
  } = useBuyTokens();

  // Fetch current token rate when connected with web3
  useEffect(() => {
    const getRateFromContract = async () => {
      if (isConnected && paymentMethod === 'web3') {
        try {
          const rate = await fetchCurrentRate();
          setTokenRate(rate);
        } catch (error) {
          console.error("Could not fetch token rate:", error);
        }
      }
    };
    
    getRateFromContract();
  }, [isConnected, paymentMethod, fetchCurrentRate]);

  // Check if amount is below minimum for web3 purchases
  useEffect(() => {
    if (paymentMethod === 'web3') {
      try {
        const inputAmount = ethers.utils.parseEther(amount || '0');
        const minAmount = ethers.utils.parseEther(MIN_CONTRIBUTION_ETH);
        setAmountTooLow(inputAmount.lt(minAmount));
      } catch (error) {
        // Invalid input will be treated as too low
        setAmountTooLow(true);
      }
    } else {
      setAmountTooLow(false);
    }
  }, [amount, paymentMethod]);

  const handleBuyNow = () => {
    // Prevent purchase if amount is too low for web3
    if (paymentMethod === 'web3' && amountTooLow) {
      return;
    }
    
    // Route to appropriate purchase method
    if (paymentMethod === 'web3') {
      handleWeb3Purchase(amount);
    } else {
      handleFiatPurchase(amount, paymentMethod);
    }
  };

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
      <div className="bg-white rounded-xl shadow-md border border-cp-neutral-100 p-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-cp-neutral-800">Purchase IHRAM</h2>
          <p className="text-cp-neutral-600 text-sm">Add tokens to your wallet to start your journey</p>
          {isConnected && (
            <p className="text-cp-green-600 font-medium mt-2">Current Balance: {parseFloat(balance).toLocaleString()} IHRAM</p>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Amount Selector */}
          <TokenAmountSelector 
            amount={amount}
            setAmount={setAmount}
            getTokenAmount={getTokenAmount}
            minAmount={MIN_CONTRIBUTION_ETH}
            tokenRate={tokenRate}
            conversionText={tokenRate > 0 ? `Rate: 1 ETH = ${tokenRate} IHRAM` : 'Loading rate...'}
          />
          
          {/* Payment Method */}
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            isConnected={isConnected}
          />
          
          {/* Warning about minimum amount */}
          {paymentMethod === 'web3' && amountTooLow && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Minimum purchase required</p>
                <p>For Web3 purchases, you need to contribute at least {MIN_CONTRIBUTION_ETH} ETH.</p>
              </div>
            </div>
          )}
          
          {/* Buy Now Button */}
          <PurchaseButton
            loading={loading}
            processingWeb3={processingWeb3}
            onClick={handleBuyNow}
            disabled={paymentMethod === 'web3' && amountTooLow}
          />
          
          {/* Compliance Notice */}
          <ComplianceNotice />
        </div>
      </div>
    </motion.div>
  );
};

export default BuyTokensForm;
