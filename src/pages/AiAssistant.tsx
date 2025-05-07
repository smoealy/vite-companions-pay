
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatBox from '@/components/ui-components/ChatBox';
import Badge from '@/components/ui-components/Badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AiAssistant = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cp-cream to-white">
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
          <h1 className="text-xl font-semibold text-cp-green-700">
            Ask Ihram AI
          </h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-cp-neutral-100 flex-1 flex flex-col overflow-hidden">
          <div className="relative bg-cp-green-600 text-white p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium">
                  Your Umrah & Hajj Assistant
                </h2>
                <p className="text-sm opacity-80">
                  Ask questions about rituals, planning, or Islamic finance
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white opacity-80 hover:opacity-100">
                      <Info size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Get answers to your questions about Umrah and Hajj rituals, 
                      travel planning, and Islamic finance principles.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="absolute -top-2 -right-2">
              <Badge label="Basic Plan" variant="default" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatBox />
          </div>
        </div>
        
        {/* Suggested Questions */}
        <div className="mt-4 bg-white border border-cp-neutral-100 rounded-xl p-4">
          <h3 className="text-sm font-medium text-cp-neutral-700 mb-3">Suggested Questions</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "What are the key steps of Umrah?",
              "How much does Hajj cost?",
              "What is the best time for Umrah?",
              "What is a Sukuk investment?",
            ].map((question, index) => (
              <Button 
                key={index}
                variant="outline" 
                size="sm"
                className="text-xs bg-cp-neutral-50 border-cp-neutral-200"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Premium Features Banner */}
        <div className="mt-4 bg-cp-gold-100 border border-cp-gold-200 rounded-xl p-4 text-center">
          <div className="text-cp-gold-800 font-medium">Premium Features Coming Soon</div>
          <div className="text-xs text-cp-gold-700 mt-1">
            Advanced travel planning, personalized itineraries, and more
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
