import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ✅ Firebase Admin Init
try {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
    initializeApp({ credential: cert(serviceAccount) });
  }
} catch (initError) {
  console.error('🔥 Firebase Init Error:', initError);
}

const db = getFirestore();
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const BASE_URL = 'https://api-m.sandbox.paypal.com'; // Change to live when ready

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, userId } = req.body;

  if (!amount || !userId) {
    console.error('❌ Missing amount or userId:', { amount, userId });
    return res.status(400).json({ error: 'Missing amount or userId' });
  }

  try {
    // Step 1: Get PayPal Access Token
    const tokenRes = await fetch(`${BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('❌ PayPal token error:', tokenData);
      return res.status(500).json({ error: 'Failed to get PayPal access token', details: tokenData });
    }

    const access_token = tokenData.access_token;

    // Step 2: Create PayPal Order
    const orderRes = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
            custom_id: userId,
          },
        ],
        application_context: {
          return_url: 'https://vite-companions-pay.vercel.app/dashboard?paypal=success',
          cancel_url: 'https://vite-companions-pay.vercel.app/dashboard?paypal=cancel',
        },
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      console.error('❌ PayPal order creation failed:', orderData);
      return res.status(500).json({ error: 'Failed to create PayPal order', details: orderData });
    }

    const approvalUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href;
    if (!approvalUrl) {
      console.error('❌ No approval URL found in PayPal order:', orderData);
      return res.status(500).json({ error: 'No approval URL found from PayPal.' });
    }

    // Step 3: Log to Firestore
    const userRef = db.collection('users').doc(userId);
    await userRef.set(
      {
        icTransactions: [
          {
            type: 'paypal',
            amount: parseFloat(amount),
            timestamp: new Date().toISOString(),
            status: 'pending',
          },
        ],
      },
      { merge: true }
    );

    return res.status(200).json({ approvalUrl });
  } catch (error) {
    console.error('🔥 PayPal Handler Error:', error);
    return res.status(500).json({ error: 'Unexpected server error', debug: String(error) });
  }
}
