
import React from 'react';
import { Button } from '@/components/ui/button';

interface RedeemCardProps {
  tier: 'bronze' | 'silver' | 'gold';
  tokens: number;
  benefits: string[];
  onRedeem: () => void;
}

const RedeemCard: React.FC<RedeemCardProps> = ({
  tier,
  tokens,
  benefits,
  onRedeem
}) => {
  const getTierStyles = () => {
    switch (tier) {
      case 'bronze':
        return {
          background: 'bg-gradient-to-br from-amber-700 to-amber-900',
          border: 'border-amber-600'
        };
      case 'silver':
        return {
          background: 'bg-gradient-to-br from-gray-300 to-gray-500',
          border: 'border-gray-400'
        };
      case 'gold':
        return {
          background: 'bg-gradient-to-br from-cp-gold-400 to-cp-gold-600',
          border: 'border-cp-gold-300'
        };
      default:
        return {
          background: 'bg-gradient-to-br from-amber-700 to-amber-900',
          border: 'border-amber-600'
        };
    }
  };

  const styles = getTierStyles();

  return (
    <div className={`rounded-xl shadow-md overflow-hidden border ${styles.border}`}>
      <div className={`${styles.background} text-white p-4 text-center`}>
        <h3 className="font-outfit font-bold text-xl capitalize">{tier} Package</h3>
        <div className="mt-1 font-semibold">
          {tokens.toLocaleString()} IHRAM
        </div>
      </div>
      
      <div className="p-4 bg-white">
        <ul className="space-y-2 mb-4">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <div className="mr-2 mt-0.5 text-cp-green-600">•</div>
              <span className="text-sm text-cp-neutral-700">{benefit}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={onRedeem}
          className="w-full gradient-green hover:opacity-90"
        >
          Redeem Now
        </Button>
      </div>
    </div>
  );
};

export default RedeemCard;
