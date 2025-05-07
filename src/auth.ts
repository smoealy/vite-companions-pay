
import { auth, provider } from './firebaseConfig';
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error", error);
    throw error; // Rethrow for proper handling in UI components
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error("Sign out error", error);
    throw error;
  }
};
