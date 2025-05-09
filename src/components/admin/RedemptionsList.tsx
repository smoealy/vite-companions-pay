// File: src/components/admin/RedemptionsList.tsx

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { listenToRedemptions } from '@/utils/firestoreService';
import RedemptionDetails from './RedemptionDetails';
import { exportToCSV } from '@/utils/exportCSV';

interface FormData {
  name: string;
  email: string;
  country: string;
  [key: string]: any;
}

interface Redemption {
  id: string;
  formData: FormData;
  tier: string;
  status: string;
  timestamp: string;
}

interface RedemptionsListProps {
  loading: boolean;
  statusFilter: string;
  countryFilter: string;
  tierFilter: string;
  searchQuery: string;
  resetFilters: () => void;
  openSubmissionId: string | null;
  handleToggleSubmission: (id: string) => void;
  handleViewDetails: (submission: Redemption) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getTierBadge: (tier: string) => React.ReactNode;
}

const RedemptionsList = ({
  loading,
  statusFilter,
  countryFilter,
  tierFilter,
  searchQuery,
  resetFilters,
  openSubmissionId,
  handleToggleSubmission,
  handleViewDetails,
  getStatusBadge,
  getTierBadge
}: RedemptionsListProps) => {
  const [submissions, setSubmissions] = useState<Redemption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    const unsubscribe = listenToRedemptions((data) => {
      const sorted = data
        .filter(d => d.formData) // safety check
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSubmissions(sorted);
    });
    return () => unsubscribe();
  }, []);

  const filtered = submissions.filter((submission) => {
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesCountry = countryFilter === 'all' || submission.formData?.country?.toLowerCase().includes(countryFilter.toLowerCase());
    const matchesTier = tierFilter === 'all' || submission.tier === tierFilter;
    const matchesSearch = !searchQuery || submission.formData?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCountry && matchesTier && matchesSearch;
  });

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md bg-gray-50">
        <p className="text-cp-neutral-500">No submissions found matching the criteria</p>
        {(statusFilter !== 'all' || countryFilter !== 'all' || tierFilter !== 'all' || searchQuery) && (
          <Button variant="link" onClick={resetFilters} className="mt-2">
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2">
        <p className="text-sm text-cp-neutral-600">
          Showing {paginated.length} of {filtered.length} results
        </p>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered, 'redemptions')}>
          Export CSV
        </Button>
      </div>

      {paginated.map((submission) => (
        <Collapsible
          key={submission.id}
          open={openSubmissionId === submission.id}
          onOpenChange={() => handleToggleSubmission(submission.id)}
          className="border rounded-lg overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <div>
                  <p className="font-medium">{submission.formData.name || 'Unnamed'}</p>
                  <p className="text-xs text-cp-neutral-500">{submission.formData.email || 'No Email'}</p>
                </div>
                <div className="flex gap-2">
                  {getTierBadge(submission.tier)}
                  {getStatusBadge(submission.status)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-cp-neutral-600 hidden sm:inline">
                  {new Date(submission.timestamp).toLocaleDateString()}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(submission);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <RedemptionDetails
              submission={submission}
              getStatusBadge={getStatusBadge}
              getTierBadge={getTierBadge}
              handleViewDetails={handleViewDetails}
            />
          </CollapsibleContent>
        </Collapsible>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            Previous
          </Button>
          <span className="text-sm font-medium px-2">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default RedemptionsList;
