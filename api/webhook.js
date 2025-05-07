
// Stripe webhook for processing completed checkout sessions
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { query, where, getDocs, collection, doc, updateDoc, addDoc } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to update user balance
async function incrementUserBalance(userId, amount) {
  try {
    // Get user document
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error('User not found:', userId);
      return false;
    }
    
    const userDoc = querySnapshot.docs[0];
    const currentBalance = userDoc.data().balance || 0;
    
    // Update balance
    await updateDoc(doc(db, 'users', userDoc.id), {
      balance: currentBalance + amount
    });
    
    // Log the transaction
    await addDoc(collection(db, 'tokenPurchases'), {
      userId,
      amountUsd: amount,
      tokenAmount: amount,
      timestamp: new Date(),
      paymentMethod: 'stripe',
      status: 'completed'
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user balance:', error);
    return false;
  }
}

module.exports = async (req, res) => {
  console.log("Webhook endpoint hit:", req.method);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, stripe-signature'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    // Verify webhook signature if secret is available
    if (sig && endpointSecret) {
      event = stripe.webhooks.constructEvent(
        req.rawBody || req.body,
        sig,
        endpointSecret
      );
      console.log("Webhook verified with signature");
    } else {
      // For development without signature verification
      event = JSON.parse(req.body);
      console.log("Webhook processed without signature verification");
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook Error', details: err.message });
  }
  
  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log("Processing completed checkout session:", session.id);
    
    // Get customer details from the session metadata
    const userId = session.metadata.userId;
    const tokens = parseInt(session.metadata.tokens);
    
    if (userId && tokens) {
      console.log(`Updating balance for user ${userId} with ${tokens} tokens`);
      // Update user balance in Firestore
      const updated = await incrementUserBalance(userId, tokens);
      
      if (updated) {
        console.log(`Successfully added ${tokens} tokens to user ${userId}`);
      } else {
        console.error(`Failed to add tokens to user ${userId}`);
      }
    }
  }
  
  res.status(200).json({ received: true });
};
