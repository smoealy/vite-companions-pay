
import React from 'react';
import RedeemCard from '@/components/ui-components/RedeemCard';

export interface TierPackage {
  tier: string;
  tokens: number;
  benefits: string[];
}

interface TierPackagesProps {
  onRedeem: (tier: string) => void;
}

const TierPackages: React.FC<TierPackagesProps> = ({ onRedeem }) => {
  const tierPackages: TierPackage[] = [
    {
      tier: 'bronze',
      tokens: 5000,
      benefits: [
        'Basic Umrah package',
        'Economy accommodations',
        'Standard transportation',
        'Group guide services',
        'Basic meal plan'
      ]
    },
    {
      tier: 'silver',
      tokens: 10000,
      benefits: [
        'Enhanced Umrah package',
        'Premium accommodations',
        'Private transportation',
        'Dedicated guide',
        'Full meal plan',
        'Airport transfers included'
      ]
    },
    {
      tier: 'gold',
      tokens: 20000,
      benefits: [
        'Luxury Umrah package',
        '5-star accommodations near Haram',
        'VIP transportation',
        'Private guide & concierge',
        'Premium dining experience',
        'Airport VIP service',
        'Extended stay options'
      ]
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tierPackages.map((pkg) => (
        <RedeemCard 
          key={pkg.tier}
          tier={pkg.tier as 'bronze' | 'silver' | 'gold'}
          tokens={pkg.tokens}
          benefits={pkg.benefits}
          onRedeem={() => onRedeem(pkg.tier)}
        />
      ))}
    </div>
  );
};

export default TierPackages;
