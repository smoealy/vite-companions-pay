
import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UmrahRedemptionData } from '@/utils/firestoreService';
import RedemptionDetails from './RedemptionDetails';

interface RedemptionsListProps {
  submissions: Array<UmrahRedemptionData & { id: string }>;
  loading: boolean;
  statusFilter: string;
  countryFilter: string;
  tierFilter: string;
  searchQuery: string;
  resetFilters: () => void;
  openSubmissionId: string | null;
  handleToggleSubmission: (id: string) => void;
  handleViewDetails: (submission: UmrahRedemptionData & { id: string }) => void;
  getStatusBadge: (status: UmrahRedemptionData['status']) => React.ReactNode;
  getTierBadge: (tier: string) => React.ReactNode;
}

const RedemptionsList = ({
  submissions,
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

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md bg-gray-50">
        <p className="text-cp-neutral-500">No submissions found matching the criteria</p>
        {(statusFilter !== 'all' || countryFilter || tierFilter || searchQuery) && (
          <Button 
            variant="link" 
            onClick={resetFilters}
            className="mt-2"
          >
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
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
                  <p className="font-medium">{submission.formData.name}</p>
                  <p className="text-xs text-cp-neutral-500">{submission.formData.email}</p>
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
    </div>
  );
};

export default RedemptionsList;
