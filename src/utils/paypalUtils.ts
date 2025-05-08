export async function createPaypalSession(
  amount: number,
  uid: string,
  email: string
): Promise<void> {
  const res = await fetch('/api/payments/paypal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      uid,
      email
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal request failed: ${res.status} ${text}`);
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error("PayPal response was not valid JSON");
  }

  if (data?.redirectUrl) {
    window.location.href = data.redirectUrl;
  } else {
    throw new Error("No redirect URL returned from server.");
  }
}
