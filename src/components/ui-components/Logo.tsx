
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative w-${size/10} h-${size/10}`} style={{ width: size, height: size }}>
        <div className="absolute inset-0 bg-cp-green-600 rounded-full opacity-80"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-cp-gold-500 rounded-full animate-float"></div>
        </div>
      </div>
      <div className="font-outfit font-semibold text-xl text-cp-green-700">
        Companions<span className="text-cp-gold-500">Pay</span>
      </div>
    </div>
  );
};

export default Logo;
