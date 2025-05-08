import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ✅ Firebase Admin SDK Init
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const BASE_URL = 'https://api-m.sandbox.paypal.com'; // Change for production

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, userId } = req.body;

  if (!amount || !userId) {
    return res.status(400).json({ error: 'Missing amount or userId' });
  }

  try {
    // Step 1: Get PayPal token
    const tokenRes = await fetch(`${BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await tokenRes.json();

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
          return_url: 'https://yourdomain.com/paypal/success',
          cancel_url: 'https://yourdomain.com/paypal/cancel',
        },
      }),
    });

    const orderData = await orderRes.json();
    const approvalUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

    if (!approvalUrl) {
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
    console.error('PayPal error:', error);
    return res.status(500).json({ error: 'PayPal integration failed.' });
  }
}
