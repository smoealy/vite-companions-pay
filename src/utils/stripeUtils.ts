
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/**
 * Creates a checkout session and redirects to Stripe checkout
 */
export const createCheckoutSession = async (amount: number, userId: string, email: string) => {
  const requestData = {
    amount,
    userId,
    email
  };
  
  try {
    console.log("Creating checkout session with:", requestData);
    
    // Use the full API URL to ensure we're hitting the Vercel serverless function
    const apiUrl = `${window.location.origin}/api/create-checkout-session`;
    console.log("Sending request to:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    console.log("Response status:", response.status);
    
    const contentType = response.headers.get('Content-Type');
    console.log("Response content type:", contentType);
    
    if (response.status === 404) {
      throw new Error('API endpoint not found. Please check server configuration.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || `Server error (${response.status})`;
      throw new Error(errorMessage);
    }
    
    // Check if the response is JSON before attempting to parse it
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log("Unexpected response format:", text.substring(0, 200) + "...");
      throw new Error(`Invalid response format (${response.status}). Expected JSON, got ${contentType || 'unknown'}.`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (!data.url) {
      throw new Error('No checkout URL returned from the server.');
    }
    
    // Redirect to Stripe Checkout
    window.location.href = data.url;
    return true;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};
