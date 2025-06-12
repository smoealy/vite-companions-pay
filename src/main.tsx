import { createRoot } from 'react-dom/client';
import { WalletProvider } from '@/walletConnect';
import { UserProvider } from '@/contexts/UserContext';
import App from './App';
import './index.css';

// 🔍 DEBUG: Log VITE Firebase env vars to ensure Vercel injected them
console.log("🔥 Firebase ENV Vars:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
});

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <WalletProvider>
      <App />
    </WalletProvider>
  </UserProvider>
);
