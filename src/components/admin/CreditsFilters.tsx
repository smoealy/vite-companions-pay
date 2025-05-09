// src/components/admin/CreditsFilters.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface CreditsFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  resetFilters: () => void;
  exportCSV: () => void;
}

const CreditsFilters: React.FC<CreditsFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  resetFilters,
  exportCSV,
}) => {
  return (
    <div className="px-4 py-3 flex flex-col sm:flex-row justify-between gap-2">
      <Input
        type="text"
        placeholder="Search by email or activity type..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full sm:w-80"
      />
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={resetFilters}>
          <X className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={exportCSV}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CreditsFilters;
