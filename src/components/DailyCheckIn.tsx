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
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      const lastCheckIn = data?.lastCheckIn?.toDate?.() || null;
      const now = new Date();

      if (!lastCheckIn || now.getTime() - lastCheckIn.getTime() > 24 * 60 * 60 * 1000) {
        setShowPopup(true);
      }
    };

    checkEligibility();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};

    const currentBalance = userData.icBalance ?? 0;
    const lastCheckIn = userData.lastCheckIn?.toDate?.() || null;
    const now = new Date();

    // Handle streak logic
    let newStreak = (userData.checkInStreak ?? 0);
    if (lastCheckIn) {
      const diff = now.getTime() - lastCheckIn.getTime();
      if (diff < 48 * 60 * 60 * 1000 && diff > 24 * 60 * 60 * 1000) {
        newStreak += 1;
      } else if (diff <= 24 * 60 * 60 * 1000) {
        newStreak = userData.checkInStreak ?? 1; // already claimed today
      } else {
        newStreak = 1; // reset
      }
    } else {
      newStreak = 1;
    }

    // Update balance and metadata
    await updateDoc(userRef, {
      icBalance: currentBalance + 1,
      lastCheckIn: Timestamp.now(),
      checkInStreak: newStreak,
    });

    // Log activity
    await addDoc(collection(db, 'activity_logs'), {
      uid: user.uid,
      type: 'daily_checkin',
      amount: 1,
      timestamp: Timestamp.now(),
      description: 'Daily Check-In Reward',
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
        Come back every 24 hours to earn 1 Ihram Credit.
      </p>
      <Button onClick={handleCheckIn} disabled={loading} className="w-full">
        {loading ? 'Checking in...' : '+1 IC Today'}
      </Button>
    </div>
  );
};

export default DailyCheckIn;

