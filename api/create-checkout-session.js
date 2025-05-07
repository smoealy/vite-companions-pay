
// Vercel serverless function for Stripe checkout
import Stripe from 'stripe';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only once to prevent multiple initialization errors
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(firebaseApp);

// Set CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
};

// Main handler function (Vercel serverless function format)
export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  
  // Set CORS headers for all responses
  setCorsHeaders(res);
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Request body:", req.body);
    const { amount, userId, email } = req.body;
    
    // Validate required fields
    if (!amount || !userId || !email) {
      console.log("Missing required fields:", { amount, userId, email });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: { amount, userId, email }
      });
    }

    console.log("Creating Stripe checkout session...");
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'IHRAM Tokens',
              description: `${amount} IHRAM tokens (1 USD = 1 IHRAM)`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || process.env.FRONTEND_URL || 'https://ihram-journey-wallet.vercel.app'}/wallet?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || process.env.FRONTEND_URL || 'https://ihram-journey-wallet.vercel.app'}/wallet?canceled=true`,
      customer_email: email,
      metadata: {
        userId: userId,
        tokens: amount
      },
    });
    
    console.log("Session created:", session.id);
    
    // Record the session in Firestore
    try {
      console.log("Recording session in Firestore...");
      await addDoc(collection(db, "checkoutSessions"), {
        userId,
        sessionId: session.id,
        amount,
        status: 'created',
        createdAt: new Date().toISOString()
      });
      console.log("Session recorded successfully");
    } catch (dbError) {
      console.error('Error recording session in Firestore:', dbError);
      // Continue with the checkout even if Firestore recording fails
    }

    console.log("Returning success response with URL:", session.url);
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session', 
      details: error.message 
    });
  }
}
