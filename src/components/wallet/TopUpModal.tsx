
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/utils/stripeUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TopUpModal = ({ open, onOpenChange }: TopUpModalProps) => {
  const { userData } = useUser();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('100');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleTopUp = async () => {
    // Reset error state
    setErrorMessage(null);
    
    if (!userData) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to top up your balance",
        variant: "destructive",
      });
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      toast({
        title: "Processing",
        description: "Creating your checkout session...",
      });
      
      await createCheckoutSession(
        parseFloat(amount), 
        userData.uid, 
        userData.email || ''
      );
      
      // If createCheckoutSession doesn't redirect or throw, show this message
      toast({
        title: "Redirecting",
        description: "Taking you to the payment page...",
      });
      
    } catch (error) {
      setLoading(false);
      console.error('Error creating checkout session:', error);
      
      // Set error message for display
      const errorMsg = error instanceof Error ? 
        error.message : 
        "Failed to process payment. Please try again.";
      
      setErrorMessage(errorMsg);
      
      // Show a more user-friendly message in the toast
      toast({
        title: "Payment Error",
        description: "Could not create checkout session. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const predefinedAmounts = ['50', '100', '200', '500'];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top Up Balance</DialogTitle>
          <DialogDescription>
            Add IHRAM tokens to your wallet
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-2"
                placeholder="Enter amount"
              />
              <p className="text-xs text-muted-foreground mt-1">1 USD = 1 IHRAM token</p>
            </div>
            
            <div>
              <Label>Quick Select</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {predefinedAmounts.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={amount === value ? "default" : "outline"}
                    onClick={() => setAmount(value)}
                    className="w-full"
                  >
                    ${value}
                  </Button>
                ))}
              </div>
            </div>
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">{errorMessage}</div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleTopUp} 
            className="w-full gradient-green"
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpModal;
