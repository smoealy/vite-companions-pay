// File: api/payments/paypal.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// 🔐 Firebase Admin Init
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// 🔐 PayPal Config
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const BASE_URL = 'https://api-m.sandbox.paypal.com'; // Change to live PayPal URL when ready

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'Method Not Allowed' });
  }

  const { amount, userId, email } = req.body;

  if (!amount || !userId) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: amount or userId.' });
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
    const access_token = tokenData.access_token;

    if (!access_token) {
      console.error('No access token from PayPal:', tokenData);
      return res.status(500).json({ error: 'Unable to obtain PayPal access token.' });
    }

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
      console.error('PayPal Order Creation Failed:', orderData);
      return res.status(500).json({ error: 'Failed to create PayPal order' });
    }

    const approvalUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

    if (!approvalUrl) {
      return res.status(500).json({ error: 'No approval URL returned from PayPal' });
    }

    // Step 3: Log Pending Transaction in Firestore
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      icTransactions: FieldValue.arrayUnion({
        type: 'paypal',
        amount: parseFloat(amount),
        timestamp: new Date().toISOString(),
        status: 'pending',
      }),
    }, { merge: true });

    return res.status(200).json({ approvalUrl });
  } catch (err: any) {
    console.error('PayPal API error:', err);
    return res.status(500).json({ error: 'Unexpected server error during PayPal setup.' });
  }
}
