
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";

export async function logRedemption(data: any) {
  await addDoc(collection(db, "redemptions"), data);
}

export async function logTokenPurchase(data: any) {
  await addDoc(collection(db, "tokenPurchases"), data);
}

export async function logCardLoad(data: any) {
  await addDoc(collection(db, "cardLoads"), data);
}

export async function logFeedbackReward(data: any) {
  await addDoc(collection(db, "feedbackRewards"), data);
}

// Email notification for redemption confirmations
export async function sendConfirmationEmail(data: {
  email: string | null;
  name: string | null;
  tier: string;
  redemptionId: string;
  fileURL?: string | null;
}) {
  // Log the email details for now - would integrate with real service later
  if (process.env.NODE_ENV === 'development') {
    console.log("Sending confirmation email:", data);
  }
  
  // In a real implementation, this would call EmailJS or Firebase Extensions Email
  await addDoc(collection(db, "emailNotifications"), {
    to: data.email,
    subject: "Umrah Package Redemption Confirmation",
    templateData: {
      name: data.name || "Valued Customer",
      tier: data.tier,
      redemptionId: data.redemptionId,
      responseTime: "48 hours",
      hasPassport: data.fileURL ? true : false
    },
    timestamp: Timestamp.now()
  });
  
  return true;
}
