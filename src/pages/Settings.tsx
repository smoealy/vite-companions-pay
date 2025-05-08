import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Settings as SettingsIcon, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useUser } from "@/contexts/UserContext";
import { signOut } from '../auth';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, mode, setUserMode } = useUser();
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = React.useState(mode === 'web3');
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  const handleToggleAdvancedMode = async () => {
    const newMode = isAdvancedMode ? 'web2' : 'web3';
    
    try {
      await setUserMode(newMode);
      setIsAdvancedMode(!isAdvancedMode);
      
      toast({
        title: `${newMode === 'web3' ? 'Advanced' : 'Standard'} Mode Enabled`,
        description: newMode === 'web3' 
          ? "Wallet features are now available." 
          : "Switched to standard mode.",
      });
    } catch (error) {
      console.error("Error toggling mode:", error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setLogoutDialogOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-cp-green-50 to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-cp-neutral-700 mr-2"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft size={24} />
          </Button>
          <h1 className="text-xl font-semibold text-cp-green-700">
            Settings
          </h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6 max-w-md mx-auto space-y-6">
        {/* User info card */}
        <Card className="overflow-hidden shadow-sm border-none">
          <div className="bg-gradient-to-r from-cp-green-600 to-cp-green-700 p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mr-4 shadow-md">
                <User size={32} className="text-cp-green-600" />
              </div>
              <div className="text-white">
                <div className="text-xl font-semibold">{user?.displayName || 'User'}</div>
                <div className="text-white/80">{user?.email}</div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Settings Options */}
        <Card className="shadow-sm border-none">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Account Settings</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Information</h4>
                    <p className="text-sm text-cp-neutral-500">Update your personal details</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/profile')}>
                    Edit
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifications</h4>
                    <p className="text-sm text-cp-neutral-500">Manage email and app notifications</p>
                  </div>
                  <Button variant="outline">
                    Configure
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Advanced Features</h4>
                    <p className="text-sm text-cp-neutral-500">Show wallet and crypto options</p>
                  </div>
                  <Switch 
                    checked={isAdvancedMode}
                    onCheckedChange={handleToggleAdvancedMode}
                  />
                </div>
                
                {isAdvancedMode && (
                  <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
                    <p className="text-sm text-amber-800">
                      Advanced mode is enabled. Wallet features are now accessible.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Support</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://help.companionspay.com', '_blank')}>
                  Help Center
                </Button>
                
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('mailto:support@companionspay.com')}>
                  Contact Support
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Account</h3>
              <Separator className="mb-4" />
              
              <Button 
                variant="outline"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" 
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex sm:justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => setLogoutDialogOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
