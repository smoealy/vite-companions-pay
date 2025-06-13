
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PiggyBank, Wallet, CreditCard, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServicesGridHeader from './ServicesGridHeader';

const ServicesGrid = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-2">
      <ServicesGridHeader title="Financial Services" availableCount={4} />
      
      <motion.div 
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          className="h-auto py-4 px-3 flex flex-col items-center justify-center gap-2 bg-white shadow-sm border-cp-neutral-200 text-cp-neutral-700 hover:bg-cp-neutral-50"
          onClick={() => navigate('/wallet')}
        >
          <Wallet className="h-5 w-5 text-cp-green-600" />
          <div className="text-center">
            <div className="font-medium">IHRAM Wallet</div>
            <div className="text-xs text-cp-neutral-500 mt-1">View balance & history</div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 px-3 flex flex-col items-center justify-center gap-2 bg-white shadow-sm border-cp-neutral-200 text-cp-neutral-700 hover:bg-cp-neutral-50"
          onClick={() => navigate('/card')}
        >
          <CreditCard className="h-5 w-5 text-cp-green-600" />
          <div className="text-center">
            <div className="font-medium">Load Card</div>
            <div className="text-xs text-cp-neutral-500 mt-1">Prepaid Mastercard</div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 px-3 flex flex-col items-center justify-center gap-2 bg-white shadow-sm border-cp-neutral-200 text-cp-neutral-700 hover:bg-cp-neutral-50"
          onClick={() => navigate('/redeem')}
        >
          <PiggyBank className="h-5 w-5 text-cp-green-600" />
          <div className="text-center">
            <div className="font-medium">Redeem Umrah</div>
            <div className="text-xs text-cp-neutral-500 mt-1">Use your savings</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 px-3 flex flex-col items-center justify-center gap-2 bg-white shadow-sm border-cp-neutral-200 text-cp-neutral-700 hover:bg-cp-neutral-50"
          onClick={() => navigate('/impact')}
        >
          <Heart className="h-5 w-5 text-cp-green-600" />
          <div className="text-center">
            <div className="font-medium">Barakah Impact</div>
            <div className="text-xs text-cp-neutral-500 mt-1">Redeem for good</div>
          </div>
        </Button>
      </motion.div>
    </div>
  );
};

export default ServicesGrid;
