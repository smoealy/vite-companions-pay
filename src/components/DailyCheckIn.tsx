import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/utils/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const DailyCheckIn = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const lastCheckIn = snap.data()?.lastCheckIn;
      const today = new Date().toISOString().split('T')[0];

      if (lastCheckIn !== today) {
        setShowPopup(true);
      }
    };

    checkEligibility();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const userData = snap.data();
    const currentBalance = userData?.icBalance ?? 0;

    // Update user
    await updateDoc(userRef, {
      icBalance: currentBalance + 1,
      lastCheckIn: today,
    });

    // Log activity
    await addDoc(collection(db, 'activity_logs'), {
      uid: user.uid,
      type: 'checkin',
      amount: 1,
      timestamp: Timestamp.now(),
    });

    toast({ title: '✅ +1 Ihram Credit earned!' });
    setShowPopup(false);
    setLoading(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[300px] rounded-xl border bg-white p-4 shadow-lg">
      <h3 className="font-semibold text-lg mb-2">Daily Check-In</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Click below to earn 1 Ihram Credit today.
      </p>
      <Button onClick={handleCheckIn} disabled={loading} className="w-full">
        {loading ? 'Checking in...' : '+1 IC Today'}
      </Button>
    </div>
  );
};

export default DailyCheckIn;
