
import React from 'react';
import { MessageSquare, Upload, Star, Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EarnTokensCardProps {
  onEarnReward: (action: string, amount: number, rewardType?: string) => void;
}

const EarnTokensCard: React.FC<EarnTokensCardProps> = ({ onEarnReward }) => {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-4">
        <h2 className="text-base font-medium text-cp-green-700 mb-3 flex items-center">
          <Coins className="h-4 w-4 mr-1.5 text-cp-gold-500" />
          Earn More Tokens
        </h2>
        <div className="space-y-2">
          <Card className="border border-cp-neutral-100 hover:border-cp-gold-300 hover:shadow-sm transition-all bg-white">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-cp-green-50 p-1.5 rounded-full">
                    <MessageSquare className="text-cp-green-600 h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-cp-neutral-800">Provide Feedback</h3>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs px-3 border-cp-green-600 text-cp-green-700 rounded-full"
                  onClick={() => onEarnReward('providing feedback', 1)}
                >
                  +1 IHRAM
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-cp-neutral-100 hover:border-cp-gold-300 hover:shadow-sm transition-all bg-white">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-cp-gold-50 p-1.5 rounded-full">
                    <Upload className="text-cp-gold-600 h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-cp-neutral-800">Upload Documents</h3>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs px-3 border-cp-green-600 text-cp-green-700 rounded-full"
                  onClick={() => onEarnReward('uploading documents', 5)}
                >
                  +5 IHRAM
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-cp-neutral-100 hover:border-cp-gold-300 hover:shadow-sm transition-all bg-white">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-cp-green-50 p-1.5 rounded-full">
                    <Star className="text-cp-green-600 h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-cp-neutral-800">Refer a Friend</h3>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs px-3 border-cp-green-600 text-cp-green-700 rounded-full"
                  onClick={() => onEarnReward('referring a friend', 10)}
                >
                  +10 IHRAM
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarnTokensCard;
