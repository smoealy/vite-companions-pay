import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ImpactActionCard from '@/components/impact/ImpactActionCard';
import {
  TreePalm,
  Droplet,
  Book,
  Accessibility,
  UserCheck,
  Gift,
  ChevronLeft
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { getICBalance, deductICBalance, logImpactAction } from '@/utils/firestoreService';

const ACTIONS = {
  tree: { label: 'Plant a Tree (Madinah)', cost: 250, Icon: TreePalm },
  water: { label: 'Gift Water (in Haram)', cost: 150, Icon: Droplet },
  quran: { label: 'Gift a Quran', cost: 500, Icon: Book },
  wheelchair: { label: 'Donate a Wheelchair', cost: 1000, Icon: Accessibility },
  badal: { label: 'Perform Umrah Badal', cost: 5000, Icon: UserCheck },
  qurbani: { label: 'Sacrifice / Qurbani', cost: 3500, Icon: Gift }
} as const;

type ActionKey = keyof typeof ACTIONS;

const Impact = () => {
  const { user, refreshUserData } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ActionKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRedeem = async (action: ActionKey) => {
    if (!user) {
      toast({ title: 'Sign In Required', description: 'Please log in first', variant: 'destructive' });
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      const cost = ACTIONS[action].cost;
      const balance = await getICBalance(user.uid);
      if (balance < cost) {
        toast({ title: 'Insufficient Balance', description: `You need ${cost} IC but only have ${balance} IC.`, variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      await deductICBalance(user.uid, cost);
      await logImpactAction({
        userId: user.uid,
        email: user.email,
        action,
        amount: cost,
        timestamp: new Date()
      });
      await refreshUserData();
      toast({ title: 'Redemption Successful', description: `Thank you for your contribution!` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
      setSelected(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cp-cream to-white">
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
          <h1 className="text-xl font-semibold text-cp-green-700">Barakah Impact</h1>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-center text-sm text-cp-neutral-600 mb-6">
          Redeem your Ihram Credits for meaningful acts of charity.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(Object.keys(ACTIONS) as ActionKey[]).map(key => {
            const { label, cost, Icon } = ACTIONS[key];
            return (
              <ImpactActionCard
                key={key}
                label={label}
                cost={cost}
                Icon={Icon}
                onRedeem={() => setSelected(key)}
              />
            );
          })}
        </div>
      </div>

      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{ACTIONS[selected].label}</DialogTitle>
                <DialogDescription>
                  This will deduct {ACTIONS[selected].cost.toLocaleString()} IC from your balance. Continue?
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                <Button disabled={submitting} onClick={() => handleRedeem(selected!)} className="gradient-green">
                  {submitting ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Impact;
