
import React from 'react';
import { Search, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilterType = 'all' | 'pending' | 'reviewed' | 'contacted' | 'completed' | 'cancelled';

interface RedemptionFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: StatusFilterType;
  setStatusFilter: React.Dispatch<React.SetStateAction<StatusFilterType>>;
  tierFilter: string;
  setTierFilter: (value: string) => void;
  countryFilter: string;
  setCountryFilter: (value: string) => void;
  countries: string[];
  resetFilters: () => void;
  exportToCSV: () => void;
}

const RedemptionFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  tierFilter,
  setTierFilter,
  countryFilter,
  setCountryFilter,
  countries,
  resetFilters,
  exportToCSV
}: RedemptionFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="relative flex-grow max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-cp-neutral-400" />
        <Input
          placeholder="Search by name, email or country..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          value={statusFilter}
          onValueChange={(value: StatusFilterType) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={tierFilter}
          onValueChange={setTierFilter}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="bronze">Bronze</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={countryFilter}
          onValueChange={setCountryFilter}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={resetFilters}
          title="Clear filters"
        >
          <X size={16} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={exportToCSV}
          title="Export to CSV"
          className="ml-2"
        >
          <Download size={16} />
        </Button>
      </div>
    </div>
  );
};

export default RedemptionFilters;
