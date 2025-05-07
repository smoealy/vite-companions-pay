
import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'outline' | 'coming-soon';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'default',
  className = '' 
}) => {
  const baseClasses = "inline-flex items-center justify-center text-xs font-medium rounded-full px-2.5 py-0.5";
  
  const variantClasses = {
    'default': 'bg-cp-green-100 text-cp-green-800 border border-cp-green-200',
    'outline': 'bg-transparent border border-cp-neutral-200 text-cp-neutral-700',
    'coming-soon': 'bg-cp-gold-100 text-cp-gold-800 border border-cp-gold-200'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {label}
    </span>
  );
};

export default Badge;
