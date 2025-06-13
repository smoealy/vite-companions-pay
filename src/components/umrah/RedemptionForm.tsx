import React, { useEffect, useState } from 'react';
import { useUser } from "@/contexts/UserContext";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PassportUploader from './PassportUploader';
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

interface RedemptionFormProps {
  selectedTier: string;
  temporaryRedemptionId: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent, formData: FormData, passportFileUrl: string) => void;
}

interface FormData {
  name: string;
  email: string;
  country: string;
  arrival: string;
  makkahNights: number;
  madinahNights: number;
}

const localTierCostMap: Record<string, number> = {
  bronze: 1250,
  silver: 2500,
  gold: 5000
};

const RedemptionForm: React.FC<RedemptionFormProps> = ({
  selectedTier,
  temporaryRedemptionId,
  isSubmitting,
  onCancel,
  onSubmit
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    country: '',
    arrival: '',
    makkahNights: 1,
    madinahNights: 1
  });
  const [passportFileUrl, setPassportFileUrl] = useState<string>('');
  const [userBalance, setUserBalance] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const { user, userData } = useUser();

  useEffect(() => {
    setError('');
  }, [temporaryRedemptionId]);

  useEffect(() => {
    if (user && userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user, userData]);

  // 🔁 Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserBalance(data.icBalance || 0);
      }
    };
    fetchBalance();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tierCost = localTierCostMap[selectedTier] || 0;
    if (userBalance < tierCost) {
      setError(`You only have ${userBalance} IC. This tier requires ${tierCost} IC.`);
      return;
    }
    setError('');
    onSubmit(e, formData, passportFileUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            required 
            value={formData.name} 
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            required 
            value={formData.email} 
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input 
            id="country" 
            required 
            value={formData.country} 
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrival">Arrival City</Label>
          <Input 
            id="arrival" 
            required 
            value={formData.arrival} 
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="makkahNights">Nights in Makkah</Label>
            <Input 
              id="makkahNights" 
              type="number" 
              min="1" 
              required 
              value={formData.makkahNights} 
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="madinahNights">Nights in Madinah</Label>
            <Input 
              id="madinahNights" 
              type="number" 
              min="1" 
              required 
              value={formData.madinahNights} 
              onChange={handleInputChange}
            />
          </div>
        </div>

        {user && temporaryRedemptionId && (
          <div className="space-y-2 pt-2">
            <Label htmlFor="passport">Upload Passport/Photo ID</Label>
            <PassportUploader 
              userId={user.uid}
              redemptionId={temporaryRedemptionId}
              onUploadComplete={setPassportFileUrl}
            />
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm pt-1">
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="gradient-green hover:opacity-90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
};

export default RedemptionForm;
