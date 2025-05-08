
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useUser } from "@/contexts/UserContext";
import { submitUmrahRedemption } from '@/utils/firebase/redemptionService';
import { sendConfirmationEmail } from '@/firestore';
import { logActivity } from '@/utils/firebase/activityService';
import TierPackages from '@/components/umrah/TierPackages';
import RedemptionForm from '@/components/umrah/RedemptionForm';

const RedeemUmrah = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [temporaryRedemptionId, setTemporaryRedemptionId] = useState<string>('');
  const { user } = useUser();
  const { toast } = useToast();
  
  const handleRedeem = (tier: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    setSelectedTier(tier);
    
    // Generate a temporary redemption ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setTemporaryRedemptionId(tempId);
    
    setDialogOpen(true);
  };
  
  const handleSubmitForm = async (
    e: React.FormEvent, 
    formData: any, 
    passportFileUrl: string
  ) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit your redemption request.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tierTokens = 
        selectedTier === 'bronze' ? 5000 : 
        selectedTier === 'silver' ? 10000 : 20000;
        
      // Submit the redemption request
      const redemptionId = await submitUmrahRedemption({
        userId: user.uid,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        tier: selectedTier,
        tokenAmount: tierTokens,
        fileURL: passportFileUrl || null,
        formData: {
          ...formData,
          makkahNights: parseInt(String(formData.makkahNights)),
          madinahNights: parseInt(String(formData.madinahNights))
        }
      });
      
      // Log activity with timestamp included
      await logActivity({
        uid: user.uid,
        type: 'redemption',
        amount: -tierTokens, // Negative because it's a spending action
        timestamp: new Date(), // Adding the required timestamp
        description: `Redeemed ${selectedTier} package`,
        metadata: {
          redemptionId,
          packageTier: selectedTier,
          destinationCountry: formData.country
        }
      });
      
      // Send confirmation email
      await sendConfirmationEmail({
        email: user.email,
        name: formData.name,
        tier: selectedTier,
        redemptionId,
        fileURL: passportFileUrl || null
      });
      
      setDialogOpen(false);
      
      toast({
        title: "Redemption Request Submitted",
        description: `Thank you for your ${selectedTier} package redemption request! We'll be in touch soon.`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Error submitting redemption:", error);
      toast({
        title: "Error Submitting Redemption",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
            Redeem Umrah
          </h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-lg text-center font-medium text-cp-neutral-700 mb-6">
          Select a package that suits your pilgrimage needs
        </h2>
        
        <TierPackages onRedeem={handleRedeem} />
        
        <div className="mt-6 text-center text-xs text-cp-neutral-500">
          Savings Points are a non-refundable deposit toward Umrah
        </div>
      </div>
      
      {/* Redemption Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {selectedTier} Package Redemption
            </DialogTitle>
            <DialogDescription>
              Complete the form below to begin your Umrah journey
            </DialogDescription>
          </DialogHeader>
          <RedemptionForm
            selectedTier={selectedTier}
            temporaryRedemptionId={temporaryRedemptionId}
            isSubmitting={isSubmitting}
            onCancel={() => setDialogOpen(false)}
            onSubmit={handleSubmitForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RedeemUmrah;
