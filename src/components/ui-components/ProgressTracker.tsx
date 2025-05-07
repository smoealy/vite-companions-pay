
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  currentTokens: number;
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  currentTokens,
  className
}) => {
  const navigate = useNavigate();
  
  // Define tier thresholds
  const bronzeTier = 5000;
  const silverTier = 10000;
  const goldTier = 20000;
  
  // Calculate progress percentage to the next tier
  const getProgressPercentage = () => {
    if (currentTokens >= goldTier) return 100;
    if (currentTokens >= silverTier) return ((currentTokens - silverTier) / (goldTier - silverTier)) * 100;
    if (currentTokens >= bronzeTier) return ((currentTokens - bronzeTier) / (silverTier - bronzeTier)) * 100;
    return (currentTokens / bronzeTier) * 100;
  };
  
  const progressPercentage = getProgressPercentage();
  
  // Determine current tier
  const getCurrentTier = () => {
    if (currentTokens >= goldTier) return "gold";
    if (currentTokens >= silverTier) return "silver";
    if (currentTokens >= bronzeTier) return "bronze";
    return "starter";
  };
  
  const currentTier = getCurrentTier();
  
  // Get the next milestone information
  const getNextMilestone = () => {
    if (currentTier === "gold") return null;
    if (currentTier === "silver") return { tier: "Gold", amount: goldTier - currentTokens };
    if (currentTier === "bronze") return { tier: "Silver", amount: silverTier - currentTokens };
    return { tier: "Bronze", amount: bronzeTier - currentTokens };
  };
  
  const nextMilestone = getNextMilestone();
  
  // Get the current tier label for display
  const getCurrentTierLabel = () => {
    switch(currentTier) {
      case "gold": return "Gold";
      case "silver": return "Silver";
      case "bronze": return "Bronze";
      default: return "Starter";
    }
  };
  
  // Get target amount for current progress
  const getTargetAmount = () => {
    if (currentTokens >= goldTier) return goldTier;
    if (currentTokens >= silverTier) return goldTier;
    if (currentTokens >= bronzeTier) return silverTier;
    return bronzeTier;
  };
  
  // Determine progress bar color based on tier
  const getProgressBarClassName = () => {
    switch(currentTier) {
      case "gold": return "bg-gradient-to-r from-cp-gold-400 to-cp-gold-600";
      case "silver": return "bg-gradient-to-r from-gray-300 to-gray-500";
      case "bronze": return "bg-gradient-to-r from-amber-400 to-amber-500";
      default: return "bg-cp-green-500";
    }
  };
  
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-cp-gold-500" />
          <span className="text-xs font-medium text-cp-neutral-700">
            {currentTier === "gold" ? "Gold Status Achieved!" : `${getCurrentTierLabel()} Tier`}
          </span>
        </div>
        <span className="text-xs font-medium text-cp-green-600">
          {currentTokens.toLocaleString()} / {getTargetAmount().toLocaleString()}
        </span>
      </div>
      
      {/* Modern sleek progress bar */}
      <Progress 
        value={progressPercentage}
        className="h-1 bg-gray-100"
        indicatorClassName={getProgressBarClassName()}
      />
      
      {/* Milestone markers - minimalist design */}
      <div className="flex justify-between mt-1 text-[9px] font-medium text-cp-neutral-400">
        <div className="relative">
          <div className={cn(
            "absolute -top-3 w-1 h-1 rounded-full bg-cp-green-500",
            currentTokens >= 0 ? "opacity-100" : "opacity-40"
          )}/>
          <span>Bismillah</span>
        </div>
        
        <div className="relative">
          <div className={cn(
            "absolute -top-3 w-1 h-1 rounded-full",
            currentTokens >= bronzeTier ? "bg-amber-500 opacity-100" : "bg-gray-300 opacity-40"
          )}/>
          <span>Bronze</span>
        </div>
        
        <div className="relative">
          <div className={cn(
            "absolute -top-3 w-1 h-1 rounded-full",
            currentTokens >= silverTier ? "bg-gray-400 opacity-100" : "bg-gray-300 opacity-40"
          )}/>
          <span>Silver</span>
        </div>
        
        <div className="relative">
          <div className={cn(
            "absolute -top-3 w-1 h-1 rounded-full",
            currentTokens >= goldTier ? "bg-cp-gold-500 opacity-100" : "bg-gray-300 opacity-40"
          )}/>
          <span>Gold</span>
        </div>
      </div>
      
      {/* Current status - Clean and minimal */}
      <div className="flex items-center justify-between mt-2">
        <div>
          {currentTier === "gold" ? (
            <div className="text-cp-gold-600 font-medium text-xs">
              Gold tier achieved! 
            </div>
          ) : (
            <div className="text-cp-neutral-700 text-xs">
              <span className="font-medium">{nextMilestone?.amount.toLocaleString()}</span> more to {nextMilestone?.tier}
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => navigate('/buy-tokens')} 
          size="sm"
          className="bg-cp-green-600 hover:bg-cp-green-700 text-xs rounded-full px-3 h-7"
        >
          Buy More
        </Button>
      </div>
    </div>
  );
};

export default ProgressTracker;
