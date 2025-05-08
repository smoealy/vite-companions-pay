import React, { useEffect } from 'react';
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

  useEffect(() => {
    const paypalStatus = searchParams.get('paypal');
    const orderId = searchParams.get('token'); // PayPal returns orderId as "token"

    if (paypalStatus === 'success' && orderId && userData?.uid) {
      toast({
        title: 'Finalizing Payment...',
        description: 'Please wait while we confirm your payment.',
      });

      fetch('/api/payments/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          userId: userData.uid,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'COMPLETED') {
            toast({
              title: 'Payment Confirmed!',
              description: 'Your balance has been updated.',
            });
            refreshUserData();
          } else {
            toast({
              title: 'Capture Failed',
              description: 'Unable to verify payment. Please contact support.',
              variant: 'destructive',
            });
          }
        })
        .catch(() => {
          toast({
            title: 'Error',
            description: 'An error occurred while finalizing your payment.',
            variant: 'destructive',
          });
        });
    } else if (paypalStatus === 'cancel') {
      toast({
        title: 'Payment Cancelled',
        description: 'No changes were made.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast, refreshUserData, userData]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-cp-cream/30">
      <DashboardHeader />
      <DashboardContent />
      <Footer />
    </div>
  );
};

export default Dashboard;
