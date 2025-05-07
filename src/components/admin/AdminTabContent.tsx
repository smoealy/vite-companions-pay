
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, User, CreditCard } from 'lucide-react';
import TokenPurchasesList from './TokenPurchasesList';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

interface AdminTabContentProps {
  tab: string;
}

const AdminTabContent = ({ tab }: AdminTabContentProps) => {
  const [tokenPurchases, setTokenPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (tab === 'token-purchases') {
      const fetchTokenPurchases = async () => {
        setIsLoading(true);
        try {
          const purchasesRef = collection(db, 'tokenPurchases');
          const q = query(purchasesRef, orderBy('timestamp', 'desc'), limit(50));
          const querySnapshot = await getDocs(q);
          
          const purchases = [];
          querySnapshot.forEach((doc) => {
            purchases.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setTokenPurchases(purchases);
        } catch (error) {
          console.error("Error fetching token purchases:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTokenPurchases();
    }
  }, [tab]);

  if (tab === 'users') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage users of the Companions Pay platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center text-cp-neutral-500">
          <div className="flex flex-col items-center gap-3">
            <User size={48} className="text-cp-neutral-300" />
            <p>User management functionality coming soon</p>
            <p className="text-sm text-cp-neutral-400">You'll be able to view and manage all users, update their balances, and change their roles.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (tab === 'token-purchases') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Purchases</CardTitle>
          <CardDescription>
            View and manage IHRAM token purchases
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <TokenPurchasesList purchases={tokenPurchases} isLoading={isLoading} />
        </CardContent>
      </Card>
    );
  }
  
  if (tab === 'settings') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
          <CardDescription>
            Configure admin dashboard settings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center text-cp-neutral-500">
          <div className="flex flex-col items-center gap-3">
            <Calendar size={48} className="text-cp-neutral-300" />
            <p>Admin settings functionality coming soon</p>
            <p className="text-sm text-cp-neutral-400">Configure notification preferences, admin access levels, and customization options.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return null;
};

export default AdminTabContent;
