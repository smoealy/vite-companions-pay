
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface AmountOption {
  value: string;
  tokens?: number;
  label?: string;
}

interface TokenAmountSelectorProps {
  amount: string;
  setAmount: (amount: string) => void;
  getTokenAmount: (ethAmount: string, rate: number) => string;
  options?: AmountOption[];
  currency?: string;
  conversionText?: string;
  showCustomInput?: boolean;
  inputPrefix?: string;
  label?: string;
  className?: string;
  minAmount?: string;
  tokenRate?: number;
}

const TokenAmountSelector = ({
  amount,
  setAmount,
  getTokenAmount,
  options,
  currency = "ETH",
  conversionText = "Conversion depends on contract rate",
  showCustomInput = true,
  inputPrefix = "Ξ",
  label = "Choose ETH Amount",
  className,
  minAmount = "0.01",
  tokenRate = 0
}: TokenAmountSelectorProps) => {
  // Default quick amount options if none provided
  const defaultOptions: AmountOption[] = [
    { value: '0.01', label: 'Min: 0.01 ETH' },
    { value: '0.05', label: '0.05 ETH' },
    { value: '0.1', label: '0.1 ETH' },
    { value: '0.5', label: '0.5 ETH' },
  ];

  // Use provided options or defaults
  const amountOptions = options || defaultOptions;
  
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className={className}
    >
      <div className="space-y-6">
        {/* Quick Amount Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cp-neutral-700">
            {label}
          </label>
          <div className="grid grid-cols-4 gap-3">
            {amountOptions.map(option => (
              <button 
                key={option.value}
                onClick={() => setAmount(option.value)}
                className={cn(
                  `flex flex-col items-center justify-center p-3 rounded-lg border transition-colors`,
                  amount === option.value 
                    ? 'border-cp-green-600 bg-cp-green-50' 
                    : 'border-cp-neutral-200 bg-white hover:bg-cp-neutral-50'
                )}
              >
                <span className="text-lg font-semibold">{inputPrefix}{option.value}</span>
                <span className="text-xs text-cp-neutral-600">
                  {option.label || `${option.value} ${currency}`}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Custom Amount Input */}
        {showCustomInput && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-cp-neutral-700">
              Or Enter Custom ETH Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cp-neutral-500">
                {inputPrefix}
              </span>
              <Input 
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                min={minAmount}
                placeholder={`e.g. ${minAmount}`}
              />
            </div>
            <div className="text-sm text-cp-neutral-600 flex items-center justify-between">
              <span>{conversionText}</span>
              {tokenRate > 0 && (
                <span className="font-medium">
                  Approx: {getTokenAmount(amount, tokenRate)} IHRAM
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TokenAmountSelector;
