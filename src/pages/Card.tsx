import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card as UICard, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/firebaseConfig';
import { logCardLoad } from '@/firestore';

const Card = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadAmount, setLoadAmount] = useState<string>('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock card data - in a real app this would come from the user profile
  const cardDetails = {
    lastFour: "4321",
    name: "MUHAMMAD ABDULLAH",
    expiry: "05/28"
  };

  const handleLoadCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const amount = parseFloat(loadAmount);
      
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount greater than zero.",
          variant: "destructive"
        });
        return;
      }
      
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Log the card load to Firestore
        await logCardLoad({
          userId: currentUser.uid,
          timestamp: new Date().toISOString(),
          amount: amount,
          cardLastFour: cardDetails.lastFour
        });
        
        // Show success dialog
        setSuccessDialogOpen(true);
      } else {
        toast({
          title: "Authentication Required",
          description: "Please sign in to load your card.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading card:", error);
      toast({
        title: "Error Loading Card",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cp-cream to-white">
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
            Companions Card
          </h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6 max-w-lg mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-lg font-medium text-cp-neutral-700">
            Your Digital Mastercard
          </h2>
          <p className="text-sm text-cp-neutral-500 mt-1">
            Load IHRAM tokens to use for Umrah expenses
          </p>
        </div>
        
        {/* Virtual Card */}
        <div className="relative w-full aspect-[1.6/1] perspective">
          <div className="absolute w-full h-full rounded-2xl bg-gradient-to-br from-cp-green-600 to-cp-green-800 shadow-lg p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="text-white opacity-80">
                <div className="text-xs mb-1">Virtual Card</div>
                <div className="font-mono">
                  •••• •••• •••• {cardDetails.lastFour}
                </div>
              </div>
              <div className="flex space-x-1">
                <div className="w-8 h-8 rounded-full bg-cp-gold-500 opacity-80"></div>
                <div className="w-8 h-8 rounded-full bg-cp-gold-300 opacity-60"></div>
              </div>
            </div>
            
            <div className="text-white">
              <div className="text-xs opacity-70 mb-1">Cardholder Name</div>
              <div className="font-mono text-sm">{cardDetails.name}</div>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <div className="text-xs opacity-70">Valid Thru</div>
                  <div className="font-mono text-xs">{cardDetails.expiry}</div>
                </div>
                <div>
                  <CreditCard className="h-8 w-8 opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Load Card Form */}
        <UICard>
          <CardContent className="pt-6">
            <form onSubmit={handleLoadCard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loadAmount">Amount to Load (IHRAM)</Label>
                <Input 
                  id="loadAmount" 
                  type="number" 
                  min="1" 
                  step="1"
                  placeholder="Enter amount" 
                  value={loadAmount}
                  onChange={(e) => setLoadAmount(e.target.value)}
                  required 
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full gradient-green" 
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load Card"}
              </Button>
              
              <p className="text-xs text-center text-cp-neutral-500 mt-2">
                Card load simulation; for verified users only.
              </p>
            </form>
          </CardContent>
        </UICard>
      </div>
      
      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cp-green-700 flex items-center gap-2">
              <Check className="h-5 w-5" /> Card Loaded Successfully
            </DialogTitle>
            <DialogDescription>
              Your Companions Card has been loaded and is ready to use.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-cp-green-50 p-4 rounded-lg border border-cp-green-100 my-2">
            <div className="flex justify-between items-center">
              <span className="text-cp-neutral-700">Amount Loaded:</span>
              <span className="font-medium text-cp-green-700">{loadAmount} IHRAM</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-cp-neutral-700">Card Number:</span>
              <span className="font-medium">•••• {cardDetails.lastFour}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setSuccessDialogOpen(false);
                setLoadAmount('');
                navigate('/dashboard');
              }} 
              className="w-full gradient-green"
            >
              Return to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Card;
