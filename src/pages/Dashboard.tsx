import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { getICBalance } from '@/utils/firestoreService';
import { auth } from '@/firebaseConfig'; // ✅ fallback support
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import Footer from '@/components/ui-components/Footer';
import DailyCheckIn from '@/components/DailyCheckIn';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refreshUserData, userData } = useUser();
  const [captured, setCaptured] = useState(false);
  const [icBalance, setIcBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      const uid = userData?.uid || auth.currentUser?.uid;
      if (!uid) return;

      try {
        const balance = await getICBalance(uid);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ IC Balance for', uid, ':', balance);
        }
        setIcBalance(balance);
      } catch (err) {
        console.error('❌ Error fetching IC balance:', err);
      }
    };

    fetchBalance();
  }, [userData]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 userData:', userData);
    }
  }, [userData]);

  useEffect(() => {
    const paypalStatus = searchParams.get('paypal');
    const orderId = searchParams.get('token');

    if (!captured && paypalStatus === 'success' && orderId && userData?.uid) {
      setCaptured(true);

      toast({
        title: 'Finalizing Payment...',
        description: 'Please wait while we confirm your transaction.',
      });

      fetch('/api/payments/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, userId: userData.uid }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            toast({
              title: 'Payment Successful',
              description: `You added $${data.amount} in Ihram Credits.`,
            });
            refreshUserData();
          } else {
            toast({
              title: 'Payment Error',
              description: data.error || 'Unable to finalize PayPal payment.',
              variant: 'destructive',
            });
            setCaptured(false);
          }
        })
        .catch((err) => {
          console.error('Capture error:', err);
          toast({
            title: 'Capture Failed',
            description: 'There was an issue finalizing your payment.',
            variant: 'destructive',
          });
          setCaptured(false);
        });
    } else if (paypalStatus === 'cancel') {
      toast({
        title: 'Payment Cancelled',
        description: 'No changes were made.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast, userData, refreshUserData, captured]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-cp-cream/30">
      <DashboardHeader />

      {icBalance !== null && (
        <div className="mx-auto mt-6 max-w-sm rounded-xl border bg-white p-4 shadow">
          <div className="text-center text-cp-neutral-800">
            <div className="text-sm">Your Balance</div>
            <div className="text-2xl font-bold">
              {icBalance.toLocaleString()} Ihram Credits
            </div>
          </div>
        </div>
      )}

      <DashboardContent />
      <DailyCheckIn />
      <Footer />
    </div>
  );
};

export default Dashboard;
