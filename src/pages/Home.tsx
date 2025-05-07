
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui-components/Logo';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  
  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cp-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cp-green-50 to-white">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div 
          className="w-full max-w-md mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo className="mx-auto mb-8 w-32 h-32 animate-float" />
          
          <h1 className="text-3xl md:text-4xl font-bold text-cp-green-700 mb-4">
            Your Journey to Umrah <span className="text-cp-gold-500">Starts Here</span>
          </h1>
          
          <p className="text-lg text-cp-neutral-700 mb-8 max-w-md mx-auto">
            Save, earn, and grow toward your pilgrimage with the world's first Shariah-compliant savings system
          </p>
          
          <div className="space-y-4 mb-8">
            <Button 
              onClick={() => navigate('/login')} 
              className="w-64 py-6 text-lg gradient-green hover:opacity-90"
            >
              Start Your Journey
            </Button>
          </div>
          
          <motion.div 
            className="flex gap-2 justify-center mb-4 items-center text-cp-neutral-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex space-x-1 items-center">
              <span className="block w-2 h-2 rounded-full bg-cp-green-500"></span>
              <span className="block w-2 h-2 rounded-full bg-cp-gold-500"></span>
              <span className="block w-2 h-2 rounded-full bg-cp-green-500"></span>
            </div>
            <span className="text-xs">Shariah-Compliant Platform</span>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <div className="py-6 px-6 bg-white border-t border-cp-neutral-100">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center">
            <div className="text-xs text-cp-neutral-500">
              © 2025 Companions Pay
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-xs text-cp-neutral-500 hover:text-cp-green-600">Privacy</a>
              <a href="#" className="text-xs text-cp-neutral-500 hover:text-cp-green-600">Terms</a>
              <a href="#" className="text-xs text-cp-neutral-500 hover:text-cp-green-600">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
