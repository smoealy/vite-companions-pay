import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

  const { orderId, userId } = req.body;

  if (!orderId || !userId) {
    return res.status(400).json({ error: 'Missing orderId or userId' });
  }

  try {
    // 1. Get PayPal Access Token
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
      return res.status(500).json({ error: 'Unable to authenticate with PayPal' });
    }

    // 2. Capture Payment
    const captureRes = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok) {
      console.error('PayPal capture failed:', captureData);
      return res.status(500).json({ error: 'Capture failed', details: captureData });
    }

    const amountCaptured = parseFloat(
      captureData?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '0'
    );

    if (!amountCaptured || isNaN(amountCaptured)) {
      return res.status(400).json({ error: 'Invalid capture amount from PayPal' });
    }

    // 3. Prevent Duplicate
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data()!;
    const transactions = userData.icTransactions || [];

    // 🛑 Prevent repeat processing
    const alreadyCaptured = transactions.some(
      (tx: any) =>
        tx.type === 'paypal' &&
        tx.amount === amountCaptured &&
        tx.status === 'completed'
    );

    if (alreadyCaptured) {
      return res.status(200).json({
        success: true,
        message: 'Already captured',
        amount: amountCaptured,
      });
    }

    // 4. Update balance and transaction status
    const updatedTransactions = transactions.map((tx: any) => {
      if (
        tx.type === 'paypal' &&
        tx.amount === amountCaptured &&
        tx.status === 'pending'
      ) {
        return { ...tx, status: 'completed' };
      }
      return tx;
    });

    const updatedBalance = (userData.icBalance || 0) + amountCaptured;

    await userRef.set(
      {
        icBalance: updatedBalance,
        icTransactions: updatedTransactions,
      },
      { merge: true }
    );

    // 5. Add activity log
    await db.collection('activity_logs').add({
      uid: userId,
      type: 'paypal',
      amount: amountCaptured,
      timestamp: new Date(),
      description: 'Top-up via PayPal',
    });

    return res.status(200).json({
      success: true,
      message: 'Payment captured and balance updated',
      amount: amountCaptured,
    });
  } catch (error) {
    console.error('Capture error:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong during capture.' });
  }
}
