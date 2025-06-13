import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { getICBalance, deductICBalance, logImpactAction } from '@/utils/firestoreService';

const ACTIONS = {
  tree: { label: 'Plant a Tree (Madinah)', cost: 250 },
  water: { label: 'Gift Water (in Haram)', cost: 150 },
  quran: { label: 'Gift a Quran', cost: 500 },
  wheelchair: { label: 'Donate a Wheelchair', cost: 1000 },
  badal: { label: 'Perform Umrah Badal', cost: 5000 },
  qurbani: { label: 'Sacrifice / Qurbani', cost: 3500 }
} as const;

type ActionKey = keyof typeof ACTIONS;

const Impact = () => {
  const { user, userData, refreshUserData } = useUser();
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
    <div className="min-h-screen bg-gradient-to-b from-cp-cream to-white p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-cp-green-700 text-center">Barakah Impact</h1>
        <div className="grid grid-cols-1 gap-3">
          {(Object.keys(ACTIONS) as ActionKey[]).map(key => (
            <Button key={key} variant="outline" className="justify-between" onClick={() => setSelected(key)}>
              <span>{ACTIONS[key].label}</span>
              <span className="text-cp-green-700">{ACTIONS[key].cost} IC</span>
            </Button>
          ))}
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
