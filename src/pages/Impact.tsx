import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { deductICBalance, getICBalance, logActivity } from '@/utils/firestoreService';

const IMPACT_OPTIONS = [
  { id: 'plant_tree', label: 'Plant a Tree in Madinah', cost: 10 },
  { id: 'gift_quran', label: 'Gift a Quran', cost: 20 },
];

const Impact: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRedeem = async (option: typeof IMPACT_OPTIONS[number]) => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please sign in to redeem.', variant: 'destructive' });
      navigate('/login');
      return;
    }

    try {
      const balance = await getICBalance(user.uid);
      const cost = option.cost;

      if (balance < cost) {
        toast({
          title: 'Insufficient Balance',
          description: `You need ${cost.toLocaleString()} Ihram Credits but only have ${balance.toLocaleString()}.`,
          variant: 'destructive'
        });
        return;
      }

      await deductICBalance(user.uid, cost);

      await logActivity({
        uid: user.uid,
        type: 'redemption',
        amount: -cost,
        description: `Impact Contribution: ${option.label}`,
        timestamp: new Date(),
        metadata: { actionId: option.id }
      });

      toast({ title: 'JazakAllah khair!', description: `Thank you for supporting: ${option.label}` });
    } catch (err) {
      console.error('Error processing impact action:', err);
      toast({ title: 'Error', description: 'Unable to process your request.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cp-cream to-white p-6">
      <div className="max-w-lg mx-auto space-y-4">
        {IMPACT_OPTIONS.map(option => (
          <div key={option.id} className="bg-white p-4 rounded-lg border shadow flex justify-between items-center">
            <div>
              <div className="font-medium text-cp-neutral-800">{option.label}</div>
              <div className="text-sm text-cp-neutral-500">{option.cost.toLocaleString()} IC</div>
            </div>
            <Button onClick={() => handleRedeem(option)} className="gradient-green">Redeem</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Impact;
