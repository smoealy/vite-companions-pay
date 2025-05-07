
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="mr-auto max-w-[80%]">
      <div className="p-3 rounded-lg bg-cp-neutral-100 text-cp-neutral-800 rounded-bl-none flex items-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Thinking...
      </div>
    </div>
  );
};

export default LoadingIndicator;
