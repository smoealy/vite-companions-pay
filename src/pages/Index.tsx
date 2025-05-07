
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui-components/Logo';
import { ConnectButton } from '../walletConnect';
import Footer from '@/components/ui-components/Footer';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cp-cream to-white">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm flex justify-between items-center">
        <Logo size={40} />
        <ConnectButton />
      </div>
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4 text-cp-green-700">IHRAM Journey Wallet</h1>
        <p className="text-xl text-cp-neutral-700 max-w-md mb-8">
          The ultimate companion for your Umrah & Hajj journey
        </p>
        <div className="space-y-4">
          <Button 
            className="w-64 py-6 text-lg gradient-green hover:opacity-90"
            onClick={() => navigate('/dashboard')}
          >
            Start Your Journey
          </Button>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              className="text-cp-neutral-700"
              onClick={() => navigate('/ai-assistant')}
            >
              Ask AI Assistant
            </Button>
            <Button 
              variant="outline" 
              className="text-cp-neutral-700"
              onClick={() => navigate('/buy-tokens')}
            >
              Buy IHRAM Tokens
            </Button>
          </div>
          <Button 
            variant="secondary"
            onClick={() => navigate('/test')}
            className="mt-8"
          >
            Test Wallet Integration
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
