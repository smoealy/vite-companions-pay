
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui-components/Logo';
import { ConnectButton } from '@/walletConnect';
import { useUser } from '@/contexts/UserContext';

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, mode } = useUser();
  
  return (
    <header className="bg-white border-b py-2 px-4 shadow-sm">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center">
          <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Logo size={40} />
          </div>
          <h1 className="hidden md:inline-block ml-4 text-lg font-semibold text-cp-green-700">
            Companions Pay
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-cp-neutral-700"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </Button>
          
          {/* Only show Connect Button in web3 mode */}
          {mode === 'web3' && <ConnectButton />}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-cp-neutral-700"
                aria-label="Menu"
              >
                <Menu size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.displayName || user?.email?.split('@')[0] || 'Menu'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
