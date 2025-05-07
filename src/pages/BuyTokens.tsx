
import React from 'react';
import { motion } from 'framer-motion';
import BuyTokensHeader from '@/components/buy-tokens/BuyTokensHeader';
import BuyTokensForm from '@/components/buy-tokens/BuyTokensForm';
import InfoCards from '@/components/buy-tokens/InfoCards';

const BuyTokens = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-cp-cream to-white">
      <BuyTokensHeader />
      
      {/* Main Content */}
      <div className="p-6 max-w-lg mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <div className="bg-white rounded-xl border border-cp-neutral-200 p-4 shadow-sm">
            <h3 className="text-sm font-medium text-cp-neutral-700 mb-1">Token Purchase Information</h3>
            <p className="text-xs text-cp-neutral-600">
              Enter the amount of ETH you wish to contribute. The smart contract will calculate the exact number of IHRAM tokens you'll receive based on the current rate.
            </p>
          </div>
          
          <BuyTokensForm />
          <InfoCards />
        </motion.div>
      </div>
    </div>
  );
};

export default BuyTokens;
