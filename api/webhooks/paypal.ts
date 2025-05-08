// File: api/webhooks/paypal.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

// Ensure Firebase Admin is initialized only once
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const event = req.body;

    // Look for completed payments
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const userId = event.resource?.custom_id;
      const amount = parseFloat(event.resource?.amount?.value || '0');

      if (!userId || !amount) {
        console.error('Missing userId or amount from PayPal webhook');
        return res.status(400).end();
      }

      // Credit user in Firestore
      const userRef = db.collection('users').doc(userId);
      await userRef.set(
        {
          icBalance: amount,
          icTransactions: [
            {
              type: 'paypal',
              amount,
              timestamp: new Date().toISOString(),
            },
          ],
        },
        { merge: true }
      );

      console.log(`Credited ${amount} IC to user ${userId}`);
      return res.status(200).json({ received: true });
    }

    return res.status(200).json({ ignored: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
