
import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import Footer from '@/components/ui-components/Footer';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-cp-cream/30">
      {/* Header with ConnectButton */}
      <DashboardHeader />
      
      {/* Main Content */}
      <DashboardContent />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
