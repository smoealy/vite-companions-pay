
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui-components/Logo';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '@/auth';
import { useToast } from '@/hooks/use-toast';
import { useUser } from "../../contexts/UserContext";
import Footer from '@/components/ui-components/Footer';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useUser();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        toast({
          title: "Sign in successful",
          description: "Welcome to Companions Pay!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Sign-in Failed",
        description: "Firebase configuration error. Please check Firebase setup in the console.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = () => {
    // To be implemented
    toast({
      title: "Coming Soon",
      description: "Email sign-in will be available soon!",
    });
  };

  const handleAppleSignIn = () => {
    // To be implemented
    toast({
      title: "Coming Soon",
      description: "Apple sign-in will be available soon!",
    });
  };

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
              onClick={handleGoogleSignIn} 
              disabled={isLoading}
              className="flex gap-2 w-full py-6 bg-white text-cp-neutral-800 hover:bg-cp-neutral-100 border border-cp-neutral-200 shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
            
            <Button 
              onClick={handleAppleSignIn} 
              disabled={isLoading}
              className="flex gap-2 w-full py-6 bg-black text-white hover:bg-neutral-800 shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
              </svg>
              Continue with Apple
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cp-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-cp-neutral-500">Or</span>
              </div>
            </div>
            
            <Button 
              onClick={handleEmailSignIn} 
              disabled={isLoading}
              variant="outline"
              className="w-full py-6 border-cp-green-600 text-cp-green-700 hover:bg-cp-green-50"
            >
              Continue with Email
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
      <Footer />
    </div>
  );
};

export default Login;
