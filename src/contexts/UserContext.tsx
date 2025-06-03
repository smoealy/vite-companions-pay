import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, storage } from "@/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

type UserMode = 'web2' | 'web3';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: any;
  onboarded: boolean;
  balance: number;
  isAdmin: boolean;
  mode: UserMode;
  photoURL?: string;
  icBalance?: number;
  icTransactions?: {
    type: string;
    amount: number;
    timestamp: string;
  }[];
}

interface UserContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  mode: UserMode;
  setUserMode: (mode: UserMode) => Promise<void>;
  isAdmin: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  refreshUserData: () => Promise<UserData | null>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userData: null,
  loading: true,
  mode: 'web2',
  setUserMode: async () => {},
  isAdmin: false,
  updateUserData: async () => {},
  refreshUserData: async () => null
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<UserMode>('web2');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await createUserDocIfNeeded(currentUser);
          const enrichedUserData = { ...userDoc, uid: currentUser.uid } as UserData;
          setUserData(enrichedUserData);
          setMode(enrichedUserData?.mode || 'web2');
          setIsAdmin(enrichedUserData?.isAdmin || false);
        } catch (error) {
          console.error("Error setting up user:", error);
          setMode('web2');
          setIsAdmin(false);
        }
      } else {
        setUserData(null);
        setMode('web2');
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createUserDocIfNeeded = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const newUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        onboarded: false,
        mode: 'web2' as UserMode,
        balance: 0,
        isAdmin: false,
        icBalance: 0,
        icTransactions: [],
      };

      await setDoc(userRef, newUserData);
      return { ...newUserData, createdAt: new Date() };
    }

    return { ...userDoc.data(), uid: user.uid } as UserData;
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, data, { merge: true });

    setUserData(prev => prev ? { ...prev, ...data } : null);

    if (data.mode) {
      setMode(data.mode);
    }
  };

  const refreshUserData = async (): Promise<UserData | null> => {
    if (!user) return null;

    const userRef = doc(db, 'users', user.uid);

    try {
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const enrichedUserData = { ...data, uid: user.uid } as UserData;
        setUserData(enrichedUserData);
        setMode(enrichedUserData?.mode || 'web2');
        setIsAdmin(enrichedUserData?.isAdmin || false);
        return enrichedUserData;
      } else {
        const newUserData = await createUserDocIfNeeded(user);
        return newUserData;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  const setUserMode = async (newMode: UserMode) => {
    if (!user) return;

    setMode(newMode);
    await updateUserData({ mode: newMode });
  };

  return (
    <UserContext.Provider value={{
      user,
      userData,
      loading,
      mode,
      setUserMode,
      isAdmin,
      updateUserData,
      refreshUserData
    }}>
      {children}
    </UserContext.Provider>
  );
};
