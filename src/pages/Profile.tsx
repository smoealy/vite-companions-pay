import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Settings, User, Wallet, Gift, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { signOut } from '../auth';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  // Mock user data
  const userData = {
    name: "Muhammad Ahmad",
    email: "muhammad@example.com",
    country: "Malaysia",
    joinedDate: "January 15, 2025",
    totalTokens: 3500
  };
  
  // Mock transaction history
  const transactions = [
    { id: 1, type: "purchase", amount: 1000, date: "May 2, 2025", status: "completed" },
    { id: 2, type: "purchase", amount: 2500, date: "Apr 15, 2025", status: "completed" },
    { id: 3, type: "redemption", amount: 50, date: "Apr 20, 2025", status: "completed", details: "Umrah Package Discount" },
    { id: 4, type: "card_load", amount: 100, date: "Apr 30, 2025", status: "completed", details: "Virtual Card Load" },
  ];
  
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
  
  const handleExportActivity = () => {
    // In a real app, this would generate and download a CSV file
    toast({
      title: "Activity Export",
      description: "Your activity history has been exported to CSV.",
    });
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
            Profile
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
                <div className="text-xl font-semibold">{userData.name}</div>
                <div className="text-white/80">{userData.email}</div>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-cp-neutral-500">Country</div>
                <div className="font-medium">{userData.country}</div>
              </div>
              <div>
                <div className="text-sm text-cp-neutral-500">Member Since</div>
                <div className="font-medium">{userData.joinedDate}</div>
              </div>
              <div>
                <div className="text-sm text-cp-neutral-500">Total Tokens</div>
                <div className="font-medium">{userData.totalTokens} IHRAM</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Transaction History */}
        <Card className="shadow-sm border-none">
          <CardContent className="p-6">
            <div className="flex items-center mb-4 justify-between">
              <div className="flex items-center">
                <Calendar size={18} className="text-cp-green-600 mr-2" />
                <h3 className="text-lg font-medium">Activity History</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-cp-green-600 flex items-center gap-1"
                onClick={handleExportActivity}
              >
                <Download size={14} />
                Export
              </Button>
            </div>
            
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium capitalize">
                        {tx.type === "purchase" 
                          ? "Token Purchase" 
                          : tx.type === "redemption" 
                            ? "Umrah Redemption" 
                            : tx.type === "card_load"
                              ? "Card Load"
                              : "Transaction"}
                      </div>
                      <div className="text-sm text-cp-neutral-500">{tx.date}</div>
                      {tx.details && (
                        <div className="text-xs text-cp-neutral-600">{tx.details}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {tx.type === "purchase" ? "+" : "-"}{tx.amount} IHRAM
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-cp-green-100 text-cp-green-700 inline-block">
                        {tx.status}
                      </div>
                    </div>
                  </div>
                  <Separator className="my-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Settings & Logout */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="border-cp-green-300 text-cp-green-700 flex gap-2"
            onClick={() => {/* Navigate to settings */}}
          >
            <Settings size={18} />
            Settings
          </Button>
          
          <Button
            variant="outline"
            className="border-cp-neutral-300 text-cp-neutral-700 flex gap-2"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
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

export default Profile;
