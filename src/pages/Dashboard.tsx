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
  const { refreshUserData } = useUser();

  useEffect(() => {
    const paypalStatus = searchParams.get('paypal');

    if (paypalStatus === 'success') {
      toast({
        title: 'Payment Successful',
        description: 'Thank you! Your balance will be updated shortly.',
      });
      refreshUserData(); // ✅ Refresh balance from Firestore
    } else if (paypalStatus === 'cancel') {
      toast({
        title: 'Payment Cancelled',
        description: 'No changes were made.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast, refreshUserData]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-cp-cream/30">
      <DashboardHeader />
      <DashboardContent />
      <Footer />
    </div>
  );
};

export default Dashboard;
