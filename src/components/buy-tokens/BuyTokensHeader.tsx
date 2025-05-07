
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@/walletConnect';

const BuyTokensHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b shadow-sm p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-cp-neutral-700 mr-2"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft size={24} />
          </Button>
          <h1 className="text-xl font-semibold text-cp-green-700">
            Buy IHRAM Tokens
          </h1>
        </div>
        <ConnectButton />
      </div>
    </div>
  );
};

export default BuyTokensHeader;
