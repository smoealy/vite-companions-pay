
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Badge from '@/components/ui-components/Badge';
import { useToast } from '@/hooks/use-toast';

const SukukInvestment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  
  const handleNotifyMe = () => {
    if (email) {
      // In a real app, this would subscribe the user to notifications
      toast({
        title: "Notification Set",
        description: "We'll notify you when Sukuk investments are available",
        duration: 5000,
      });
      setEmail('');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-cp-cream to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-cp-neutral-700 mr-2"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft size={24} />
          </Button>
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-cp-green-700 mr-2">
              Sukuk Investment
            </h1>
            <Badge label="Coming Soon" variant="coming-soon" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-cp-neutral-100 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-cp-green-600 text-white p-6 text-center">
            <Building size={48} className="mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-semibold mb-2">
              Invest in Real-World Projects
            </h2>
            <p className="opacity-80">
              Earn halal returns by backing Umrah infrastructure
            </p>
          </div>
          
          {/* Features */}
          <div className="p-6">
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <CheckCircle2 size={20} className="text-cp-green-600 mr-2 flex-shrink-0" />
                <span className="text-cp-neutral-700">Shariah-compliant investments</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 size={20} className="text-cp-green-600 mr-2 flex-shrink-0" />
                <span className="text-cp-neutral-700">Support meaningful infrastructure projects</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 size={20} className="text-cp-green-600 mr-2 flex-shrink-0" />
                <span className="text-cp-neutral-700">Competitive profit rates</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 size={20} className="text-cp-green-600 mr-2 flex-shrink-0" />
                <span className="text-cp-neutral-700">Regular dividend payments</span>
              </div>
            </div>
            
            {/* Notify Form */}
            <div className="bg-cp-cream rounded-lg p-4">
              <h3 className="font-medium text-cp-neutral-800 mb-2">
                Be the first to know when available
              </h3>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleNotifyMe} 
                  className="gradient-green hover:opacity-90"
                >
                  Notify Me
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SukukInvestment;
