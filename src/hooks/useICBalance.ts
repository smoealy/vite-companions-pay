import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getICBalance } from '@/utils/firestoreService';

export const useICBalance = () => {
  const { user } = useUser();
  const [icBalance, setICBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user) {
        const balance = await getICBalance(user.uid);
        setICBalance(balance || 0);
      }
    };
    fetchBalance();
  }, [user]);

  return { icBalance };
};
