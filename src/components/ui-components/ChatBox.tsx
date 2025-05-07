
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebaseConfig';
import { logFeedbackReward } from '@/firestore';
import { getAIResponse } from '@/aiChatService';
import { useToast } from '@/hooks/use-toast';
import { Message, Role } from '@/types/chat';
import MessageItem from '@/components/chat/MessageItem';
import ChatInput from '@/components/chat/ChatInput';
import LoadingIndicator from '@/components/chat/LoadingIndicator';

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lastResponseId, setLastResponseId] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    // Initial greeting message
    setMessages([
      {
        role: 'assistant' as Role,
        content: 'Assalamu alaikum! I\'m your Umrah & Hajj assistant. How can I help you today?'
      }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user' as Role, content: userMessage }]);
    
    setIsLoading(true);
    
    try {
      const aiResponse = await getAIResponse(userMessage);
      
      // Add AI response to chat
      setMessages(prev => {
        const newMessages = [...prev, { role: 'assistant' as Role, content: aiResponse }];
        setLastResponseId(newMessages.length - 1);
        setFeedbackSubmitted(false);
        return newMessages;
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant' as Role, 
        content: 'I apologize, but I encountered an error processing your request. Please try again later.' 
      }]);
      
      toast({
        title: "Connection Error",
        description: "Unable to reach our AI assistant at the moment.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit feedback",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
      
      await logFeedbackReward({
        userId: currentUser.uid,
        timestamp: new Date().toISOString(),
        type: "aiFeedback"
      });
      
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our AI assistant",
      });
      
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <MessageItem
            key={index}
            message={message}
            isLastAiMessage={index === lastResponseId}
            feedbackSubmitted={feedbackSubmitted}
            onFeedbackSubmit={handleFeedbackSubmit}
          />
        ))}
        
        {isLoading && <LoadingIndicator />}
      </div>
      
      {/* Input area */}
      <ChatInput
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatBox;
