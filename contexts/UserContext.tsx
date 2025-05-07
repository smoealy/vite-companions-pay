
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, storage } from "../src/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

type UserMode = 'web2' | 'web3';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: any; // Firebase Timestamp
  onboarded: boolean;
  balance: number;
  isAdmin: boolean;
  mode: UserMode; // Added the mode property
  photoURL?: string;
}

interface UserContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  mode: UserMode;
  setUserMode: (mode: UserMode) => Promise<void>;
  isAdmin: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  refreshUserData: () => Promise<UserData | null>; // Updated return type
}

const UserContext = createContext<UserContextType>({
  user: null,
  userData: null,
  loading: true,
  mode: 'web2',
  setUserMode: async () => {},
  isAdmin: false,
  updateUserData: async () => {},
  refreshUserData: async () => null // Updated return default
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
        // Create user document if it doesn't exist and fetch user data
        try {
          const userDoc = await createUserDocIfNeeded(currentUser);
          setUserData(userDoc);
          setMode(userDoc?.mode || 'web2');
          setIsAdmin(userDoc?.isAdmin || false);
        } catch (error) {
          console.error("Error setting up user:", error);
          // Ensure we still set default values even if there's an error
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
        isAdmin: false
      };
      
      await setDoc(userRef, newUserData);
      return { ...newUserData, createdAt: new Date() };
    }
    
    return userDoc.data() as UserData;
  };
  
  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, data, { merge: true });
    
    // Update local state
    setUserData(prev => prev ? { ...prev, ...data } : null);
    
    // Update mode if it was changed
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
        const userData = userDoc.data() as UserData;
        setUserData(userData);
        setMode(userData?.mode || 'web2');
        setIsAdmin(userData?.isAdmin || false);
        return userData;
      } else {
        // Document doesn't exist, likely due to a race condition
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
