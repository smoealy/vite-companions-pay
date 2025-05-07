
import React from 'react';
import { Check } from 'lucide-react';

const ComplianceNotice = () => {
  return (
    <div className="text-center text-xs text-cp-neutral-500 pt-4 border-t">
      <div className="flex items-center justify-center mb-1">
        <Check size={14} className="text-cp-green-600 mr-1" />
        <span>100% Shariah-compliant</span>
      </div>
      <div>Powered by Companions Pay – MSB Licensed</div>
    </div>
  );
};

export default ComplianceNotice;
