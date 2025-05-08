// File: src/components/dashboard/TopUpModal.tsx
import React, { useState } from 'react';
import { useUser } from "@/contexts/UserContext";
import { useToast } from '@/hooks/use-toast';
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

  const handlePayPalCheckout = async () => {
    setErrorMessage(null);

    if (!userData) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to top up your balance.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount.toFixed(2),
          userId: userData.uid,
          email: userData.email || '',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.approvalUrl) {
        throw new Error(data?.error || 'PayPal approval URL not received.');
      }

      window.location.href = data.approvalUrl;

    } catch (error: any) {
      console.error("PayPal Error:", error);
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      toast({
        title: "Payment Error",
        description: error.message || "Could not start PayPal checkout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const predefinedAmounts = ['50', '100', '200', '500'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top Up Balance</DialogTitle>
          <DialogDescription>
            Add Ihram Credits (IC) using PayPal
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
              />
              <p className="text-xs text-muted-foreground mt-1">1 USD = 1 Ihram Credit (IC)</p>
            </div>

            <div>
              <Label>Quick Select</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {predefinedAmounts.map((value) => (
                  <Button
                    key={value}
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
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handlePayPalCheckout}
            className="w-full gradient-green"
            disabled={loading}
          >
            {loading ? "Redirecting..." : "Pay with PayPal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpModal;
