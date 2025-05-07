
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminHeader = () => {
  const navigate = useNavigate();
  
  return (
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
          Admin Dashboard
        </h1>
      </div>
    </div>
  );
};

export default AdminHeader;
