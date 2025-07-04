import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

// ✅ Firebase Admin SDK Init
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = getFirestore();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const BASE_URL = 'https://api-m.sandbox.paypal.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, userId } = req.body;
  if (!amount || !userId) {
    return res.status(400).json({ error: 'Missing amount or userId' });
  }

  try {
    // ✅ Step 1: Get PayPal Access Token
    const tokenRes = await fetch(`${BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('❌ PayPal Token Fetch Failed:', errText);
      return res.status(500).json({ error: 'PayPal token request failed' });
    }

    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    // ✅ Step 2: Create PayPal Order
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
    console.log('🧾 PayPal Order Response:', JSON.stringify(orderData, null, 2));

    const approvalUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href;
    if (!approvalUrl) {
      return res.status(500).json({ error: 'No approval URL found from PayPal.' });
    }

    // ✅ Step 3: Log in Firestore
    try {
      const userRef = db.collection('users').doc(userId);
      await userRef.set(
        {
          icTransactions: [
            {
              type: 'paypal',
              amount: parseFloat(amount),
              timestamp: Timestamp.now(),
              status: 'pending',
            },
          ],
        },
        { merge: true }
      );
    } catch (firestoreErr) {
      console.error('❌ Firestore Logging Error:', firestoreErr);
      // Don't fail the request if Firestore logging fails
    }

    return res.status(200).json({ approvalUrl });
  } catch (error: any) {
    console.error('❌ PayPal Integration Error:', error?.response?.data || error.message || error);
    return res.status(500).json({ error: 'PayPal integration failed.', details: error.message });
  }
}
