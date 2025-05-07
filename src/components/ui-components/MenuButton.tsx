
import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuButtonProps {
  title: string;
  icon: LucideIcon;
  to: string;
  comingSoon?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  title,
  icon: Icon,
  to,
  comingSoon = false
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link 
        to={to}
        className={`relative flex flex-col items-center p-4 rounded-xl bg-white shadow-sm border border-cp-neutral-100
                  hover:shadow-md transition-all duration-300 
                  ${comingSoon ? 'opacity-80 hover:opacity-100' : ''}`}
      >
        <div className="rounded-full p-3 mb-2 bg-gradient-to-br from-cp-green-500 to-cp-green-700 text-white shadow-sm">
          <Icon size={20} />
        </div>
        <span className="text-sm font-medium text-cp-neutral-800">{title}</span>
        {comingSoon && (
          <div className="absolute -top-2 -right-2">
            <Badge label="Coming Soon" variant="coming-soon" />
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default MenuButton;
