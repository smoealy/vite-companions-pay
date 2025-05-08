import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import Footer from '@/components/ui-components/Footer';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refreshUserData, userData } = useUser();
  const [captured, setCaptured] = useState(false); // NEW

  useEffect(() => {
    const paypalStatus = searchParams.get('paypal');
    const orderId = searchParams.get('token');

    if (!captured && paypalStatus === 'success' && orderId && userData?.uid) {
      setCaptured(true); // prevent refiring

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
            setCaptured(false); // allow retry if error
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
      <DashboardContent />
      <Footer />
    </div>
  );
};

export default Dashboard;

