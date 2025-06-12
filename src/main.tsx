import { createRoot } from 'react-dom/client';
import { WalletProvider } from '@/walletConnect';
import { UserProvider } from '@/contexts/UserContext';
import App from './App';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <WalletProvider>
      <App />
    </WalletProvider>
  </UserProvider>
);


