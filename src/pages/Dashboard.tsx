import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import Footer from '@/components/ui-components/Footer';
import { getICBalance } from '@/utils/firestoreService';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refreshUserData, userData } = useUser();
  const [captured, setCaptured] = useState(false);

  const [balance, setBalance] = useState<number>(0); // ✅ NEW: balance state

  useEffect(() => {
    if (userData?.uid) {
      getICBalance(userData.uid)
        .then(setBalance)
        .catch((err) => {
          console.error('Error fetching balance:', err);
        });
    }
  }, [userData?.uid]);

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
            getICBalance(userData.uid).then(setBalance); // ✅ REFRESH balance
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
      
      {/* ✅ Optional Balance Display */}
      <div className="text-center text-cp-green-700 font-semibold text-sm mt-2">
        {userData?.uid && (
          <p>
            Ihram Credit Balance: <span className="font-bold">{balance.toLocaleString()} IC</span>
          </p>
        )}
      </div>

      <DashboardContent />
      <Footer />
    </div>
  );
};

export default Dashboard;
