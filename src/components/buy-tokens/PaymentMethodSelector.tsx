
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Building, Wallet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export interface PaymentMethod {
  id: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  isConnected?: boolean;
  variant?: 'select' | 'radio' | 'button';
  customMethods?: PaymentMethod[];
  label?: string;
  className?: string;
}

const PaymentMethodSelector = ({ 
  paymentMethod, 
  setPaymentMethod, 
  isConnected = false,
  variant = 'select',
  customMethods,
  label = "Payment Method",
  className
}: PaymentMethodSelectorProps) => {
  // Define default payment methods
  const defaultMethods: PaymentMethod[] = [
    {
      id: 'card',
      label: 'Credit Card',
      icon: <CreditCard size={16} className="mr-2 text-cp-neutral-600" />
    },
    {
      id: 'bank',
      label: 'Bank Transfer',
      icon: <Building size={16} className="mr-2 text-cp-neutral-600" />
    },
    {
      id: 'web3',
      label: 'Web3 Direct Purchase',
      icon: <Wallet size={16} className="mr-2 text-cp-neutral-600" />,
      disabled: !isConnected
    }
  ];

  // Use custom methods if provided, otherwise use defaults
  const methods = customMethods || defaultMethods;

  // Filter out disabled methods for display
  const filteredMethods = methods.filter(method => !method.disabled);

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className={className}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-cp-neutral-700">
          {label}
        </label>
        
        {variant === 'select' && (
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {filteredMethods.map(method => (
                <SelectItem key={method.id} value={method.id}>
                  <div className="flex items-center">
                    {method.icon}
                    {method.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {variant === 'radio' && (
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
            {filteredMethods.map(method => (
              <div key={method.id} className="flex items-center space-x-2">
                <RadioGroupItem value={method.id} id={`radio-${method.id}`} />
                <label htmlFor={`radio-${method.id}`} className="flex items-center cursor-pointer">
                  {method.icon}
                  <span>{method.label}</span>
                </label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {variant === 'button' && (
          <div className="grid grid-cols-2 gap-2">
            {filteredMethods.map(method => (
              <button
                key={method.id}
                className={cn(
                  "flex items-center justify-center p-3 rounded-lg border transition-all",
                  paymentMethod === method.id 
                    ? "border-cp-green-600 bg-cp-green-50"
                    : "border-cp-neutral-200 bg-white hover:bg-cp-neutral-50"
                )}
                onClick={() => setPaymentMethod(method.id)}
              >
                {method.icon}
                <span>{method.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PaymentMethodSelector;
