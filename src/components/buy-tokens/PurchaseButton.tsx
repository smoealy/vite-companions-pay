
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PurchaseButtonProps {
  loading: boolean;
  processingWeb3: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const PurchaseButton = ({ 
  loading, 
  processingWeb3, 
  onClick, 
  disabled = false,
  className 
}: PurchaseButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      disabled={loading || processingWeb3 || disabled}
      className={cn(
        "w-full bg-gradient-to-r from-cp-green-600 to-cp-green-700 hover:opacity-90 py-6",
        disabled && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      {(loading || processingWeb3) ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {processingWeb3 ? 'Confirming Transaction...' : 'Processing...'}
        </span>
      ) : disabled ? (
        'Minimum ETH Required'
      ) : (
        'Buy Now'
      )}
    </Button>
  );
};

export default PurchaseButton;
