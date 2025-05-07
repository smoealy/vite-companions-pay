
import React from 'react';
import { cn } from '@/lib/utils';
import { Coins, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface TokenDisplayProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showEarnedToday?: boolean;
  earnedToday?: number;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ 
  amount,
  className = '',
  size = 'md',
  showEarnedToday = false,
  earnedToday = 0
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };
  
  const containerClasses = cn(
    "flex flex-col items-center",
    className
  );
  
  return (
    <div className={containerClasses}>
      <motion.div 
        className="text-sm font-medium opacity-90 mb-1"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Your Balance
      </motion.div>
      <motion.div 
        className={`flex items-center gap-2 ${sizeClasses[size]} font-bold`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
      >
        <Coins className="w-6 h-6 text-cp-gold-500" />
        <span>{amount.toLocaleString()}</span>
        <span className="font-semibold">IHRAM</span>
      </motion.div>
      <div className="mt-1 text-xs opacity-80 flex items-center gap-1">
        <span>≈ ${amount.toLocaleString()} USD</span>
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
        <span>1 IHRAM = $1.00</span>
      </div>
      
      {showEarnedToday && (
        <motion.div 
          className="mt-2 text-xs text-cp-green-600 flex items-center gap-1 bg-cp-green-50 px-2 py-1 rounded-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <TrendingUp className="w-3 h-3" />
          <span>+{earnedToday} earned today</span>
        </motion.div>
      )}
    </div>
  );
};

export default TokenDisplay;
