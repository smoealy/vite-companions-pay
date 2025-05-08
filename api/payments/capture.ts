// File: api/payments/capture.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const BASE_URL = 'https://api-m.sandbox.paypal.com'; // Use live in production

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId, userId } = req.body;
  if (!orderId || !userId) {
    return res.status(400).json({ error: 'Missing orderId or userId' });
  }

  try {
    // Step 1: Get access token
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

    // Step 2: Capture the payment
    const captureRes = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();
    if (!captureRes.ok) {
      return res.status(500).json({ error: 'Capture failed', details: captureData });
    }

    const amountCaptured = parseFloat(
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '0'
    );

    // Step 3: Update Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data()!;
    const updatedTransactions = (userData.icTransactions || []).map((tx: any) =>
      tx.type === 'paypal' && tx.amount === amountCaptured && tx.status === 'pending'
        ? { ...tx, status: 'completed' }
        : tx
    );

    const updatedBalance = (userData.icBalance || 0) + amountCaptured;

    await userRef.set(
      {
        icBalance: updatedBalance,
        icTransactions: updatedTransactions,
      },
      { merge: true }
    );

    return res.status(200).json({ success: true, amount: amountCaptured });
  } catch (error) {
    console.error('Capture error:', error);
    return res.status(500).json({ error: 'Something went wrong during capture.' });
  }
}
