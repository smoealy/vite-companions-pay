import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useUser } from "@/contexts/UserContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BuyTokens from "./pages/BuyTokens";
import RedeemUmrah from "./pages/RedeemUmrah";
import Impact from "./pages/Impact";
import AiAssistant from "./pages/AiAssistant";
import SukukInvestment from "./pages/SukukInvestment";
import Card from "./pages/Card";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import TestWalletIntegration from "./pages/TestWalletIntegration";
import Wallet from "./pages/Wallet";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin w-8 h-8 border-4 border-cp-green-500 border-t-transparent rounded-full"></div>
        <p className="text-cp-neutral-600">Loading...</p>
      </div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Web3 feature route (only accessible if mode is 'web3')
const Web3Route = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, mode } = useUser();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin w-8 h-8 border-4 border-cp-green-500 border-t-transparent rounded-full"></div>
        <p className="text-cp-neutral-600">Loading...</p>
      </div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (mode !== 'web3') {
    return <Navigate to="/settings" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useUser();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin w-8 h-8 border-4 border-cp-green-500 border-t-transparent rounded-full"></div>
        <p className="text-cp-neutral-600">Loading...</p>
      </div>
    </div>;
  }
  
  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/redeem" element={<ProtectedRoute><RedeemUmrah /></ProtectedRoute>} />
            <Route path="/impact" element={<ProtectedRoute><Impact /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
            <Route path="/card" element={<ProtectedRoute><Card /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />

            {/* Admin route */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Web3 routes */}
            <Route path="/buy-tokens" element={<Web3Route><BuyTokens /></Web3Route>} />
            <Route path="/sukuk" element={<Web3Route><SukukInvestment /></Web3Route>} />
            <Route path="/test" element={<Web3Route><TestWalletIntegration /></Web3Route>} />

            {/* Not found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
