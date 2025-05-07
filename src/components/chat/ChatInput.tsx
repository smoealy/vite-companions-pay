
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSendMessage,
  isLoading,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t p-4">
      <form 
        className="flex items-end gap-2" 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
      >
        <Textarea
          placeholder="Type your question here..."
          className="flex-1 resize-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="bg-cp-green-600 text-white hover:bg-cp-green-700"
          disabled={isLoading || !input.trim()}
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
