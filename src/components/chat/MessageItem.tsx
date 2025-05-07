
import React from 'react';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/chat';

interface MessageItemProps {
  message: Message;
  isLastAiMessage: boolean;
  feedbackSubmitted: boolean;
  onFeedbackSubmit: () => Promise<void>;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLastAiMessage,
  feedbackSubmitted,
  onFeedbackSubmit,
}) => {
  return (
    <div className={`mb-4 ${message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}>
      <div 
        className={`p-3 rounded-lg ${
          message.role === 'user' 
            ? 'bg-cp-green-600 text-white rounded-br-none' 
            : 'bg-cp-neutral-100 text-cp-neutral-800 rounded-bl-none'
        }`}
      >
        {message.content}
      </div>
      
      {/* Feedback button after AI responses */}
      {message.role === 'assistant' && isLastAiMessage && !feedbackSubmitted && (
        <div className="mt-2 flex justify-start">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center text-cp-neutral-600 hover:text-cp-green-600"
            onClick={onFeedbackSubmit}
          >
            <ThumbsUp className="h-3 w-3 mr-1" />
            Submit Feedback
          </Button>
        </div>
      )}
      
      {message.role === 'assistant' && isLastAiMessage && feedbackSubmitted && (
        <div className="mt-2 text-xs text-cp-green-600 flex items-center">
          <ThumbsUp className="h-3 w-3 mr-1" />
          Feedback submitted
        </div>
      )}
    </div>
  );
};

export default MessageItem;
