
import React from 'react';
import { motion } from 'framer-motion';

interface ServicesGridHeaderProps {
  title?: string;
  availableCount: number;
}

const ServicesGridHeader: React.FC<ServicesGridHeaderProps> = ({ title = "Services", availableCount }) => {
  return (
    <motion.h2 
      className="text-base font-medium text-cp-green-700 mb-3 flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span>{title}</span>
      <span className="text-xs bg-cp-green-50 text-cp-green-700 px-2 py-0.5 rounded-full ml-2">
        {availableCount} Available
      </span>
    </motion.h2>
  );
};

export default ServicesGridHeader;
