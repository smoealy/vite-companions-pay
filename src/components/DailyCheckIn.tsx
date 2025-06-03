import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/utils/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const DailyCheckIn = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);

  useEffect(() => {
    const checkLastCheckIn = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const lastCheckIn = snap.data()?.lastCheckIn;
      const today = new Date().toISOString().split('T')[0];
      if (lastCheckIn === today) setCheckedInToday(true);
    };
    checkLastCheckIn();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const userData = snap.data();
    const lastCheckIn = userData?.lastCheckIn;
    const balance = userData?.icBalance || 0;

    if (lastCheckIn === today) {
      setCheckedInToday(true);
      toast({ title: 'Already checked in today.' });
      setLoading(false);
      return;
    }

    // Update balance + lastCheckIn
    await updateDoc(userRef, {
      icBalance: balance + 1,
      lastCheckIn: today
    });

    // Log it
    await addDoc(collection(db, 'activity_logs'), {
      uid: user.uid,
      type: 'checkin',
      amount: 1,
      timestamp: Timestamp.now()
    });

    toast({ title: '✅ +1 Ihram Credit earned today!' });
    setCheckedInToday(true);
    setLoading(false);
  };

  return (
    <div className="mt-4">
      <Button onClick={handleCheckIn} disabled={checkedInToday || loading}>
        {checkedInToday ? 'Checked in Today ✅' : 'Daily Check-In (+1 IC)'}
      </Button>
    </div>
  );
};

export default DailyCheckIn;
