
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import ProgressTracker from '@/components/ui-components/ProgressTracker';
import { useEthersTokenBalance } from '@/hooks/useEthersTokenBalance';

const ProgressTrackerCard: React.FC = () => {
  const { balance } = useEthersTokenBalance();
  const tokenBalance = parseFloat(balance);
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-4">
          <h2 className="text-base font-medium text-cp-green-700 mb-3 flex items-center">
            <Star className="h-4 w-4 mr-1.5 text-cp-gold-500" />
            Umrah Goals
          </h2>
          <ProgressTracker currentTokens={tokenBalance} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgressTrackerCard;
