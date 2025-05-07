
import React from 'react';
import { motion } from 'framer-motion';

const InfoCards = () => {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-cp-neutral-100 shadow-sm">
          <h3 className="font-medium mb-2">What are IHRAM tokens?</h3>
          <p className="text-sm text-cp-neutral-600">IHRAM tokens are digital assets that you can redeem for Umrah packages or use with our other services. Each token is worth $1.00 USD.</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-cp-neutral-100 shadow-sm">
          <h3 className="font-medium mb-2">How can I use my tokens?</h3>
          <p className="text-sm text-cp-neutral-600">Redeem for Umrah packages, load to your virtual card, donate, or save toward future pilgrimages.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default InfoCards;
