// File: api/payments/paypal.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const BASE_URL = 'https://api-m.sandbox.paypal.com'; // Change to live URL for production

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, userId } = req.body;

  if (!amount || !userId) {
    return res.status(400).json({ error: 'Missing amount or userId' });
  }

  try {
    // 1. Get PayPal access token
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

    // 2. Create PayPal order
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

    return res.status(200).json({ approvalUrl });
  } catch (err) {
    console.error('PayPal error:', err);
    return res.status(500).json({ error: 'PayPal integration failed.' });
  }
}
