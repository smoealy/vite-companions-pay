import { auth, provider } from './firebaseConfig';
import {
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

// ✅ Google sign-in
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in error', error);
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(auth, provider);
        return null;
      } catch (redirectError) {
        console.error('Google redirect sign-in error', redirectError);
        throw redirectError;
      }
    }
    throw error;
  }
};

// ✅ Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Sign out error', error);
    throw error;
  }
};

// ✅ Email sign-up
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email sign-up error', error);
    throw error;
  }
};

// ✅ Email sign-in
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email sign-in error', error);
    throw error;
  }
};
