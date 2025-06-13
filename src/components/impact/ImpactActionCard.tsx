import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ImpactActionCardProps {
  label: string;
  cost: number;
  Icon: LucideIcon;
  onRedeem: () => void;
}

const ImpactActionCard: React.FC<ImpactActionCardProps> = ({
  label,
  cost,
  Icon,
  onRedeem
}) => {
  return (
    <Card className="p-6 flex flex-col items-center text-center rounded-lg shadow-sm border-cp-neutral-100 hover:shadow-lg transition hover:-translate-y-1">
      <div className="rounded-full p-4 mb-3 bg-gradient-to-br from-cp-green-500 to-cp-green-700 text-white shadow">
        <Icon size={32} />
      </div>
      <div className="text-sm font-medium text-cp-neutral-800">{label}</div>
      <div className="text-xs text-cp-neutral-500 mb-4">{cost.toLocaleString()} IC</div>
      <Button onClick={onRedeem} className="w-full gradient-green hover:opacity-90">
        Redeem
      </Button>
    </Card>
  );
};

export default ImpactActionCard;
