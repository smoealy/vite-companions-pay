import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getICBalance } from '@/utils/firestoreService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Tier {
  name: string;
  amount: number;
  label: string;
  perks: string[];
}

const TIERS: Tier[] = [
  {
    name: 'bronze',
    amount: 5000,
    label: 'Bronze Package',
    perks: ['Standard hotels', 'Group transport', '3-star rating']
  },
  {
    name: 'silver',
    amount: 10000,
    label: 'Silver Package',
    perks: ['Premium hotels', 'Private car', '4-star rating']
  },
  {
    name: 'gold',
    amount: 20000,
    label: 'Gold Package',
    perks: ['Luxury hotels', 'Full concierge', '5-star rating']
  }
];

interface Props {
  onRedeem: (tier: string) => void;
}

const TierPackages: React.FC<Props> = ({ onRedeem }) => {
  const { user } = useUser();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user) {
        const bal = await getICBalance(user.uid);
        setBalance(bal);
        setLoading(false);
      }
    };
    fetchBalance();
  }, [user]);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {TIERS.map((tier) => {
        const affordable = balance >= tier.amount;
        return (
          <Card key={tier.name} className="p-6 flex flex-col items-center text-center shadow-md border border-cp-neutral-100">
            <h3 className="text-lg font-bold text-cp-green-800">{tier.label}</h3>
            <p className="text-cp-neutral-600 text-sm mt-1 mb-4">
              {tier.amount.toLocaleString()} IC required
            </p>
            <ul className="text-sm text-cp-neutral-500 mb-6 space-y-1">
              {tier.perks.map((perk, i) => (
                <li key={i}>• {perk}</li>
              ))}
            </ul>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button
                    disabled={!affordable || loading}
                    onClick={() => onRedeem(tier.name)}
                    className={cn(
                      'w-full',
                      !affordable ? 'opacity-60 cursor-not-allowed' : 'gradient-green hover:opacity-90'
                    )}
                  >
                    Redeem
                  </Button>
                </div>
              </TooltipTrigger>
              {!affordable && (
                <TooltipContent side="top">
                  <div className="flex items-center gap-2 text-xs text-cp-neutral-600">
                    <Info size={14} /> You don’t have enough balance
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </Card>
        );
      })}
    </div>
  );
};

export default TierPackages;
