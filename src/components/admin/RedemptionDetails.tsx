import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { UmrahRedemptionData } from '@/utils/firestoreService';
import PassportUploader from '@/components/umrah/PassportUploader';

interface RedemptionDetailsProps {
  submission: (UmrahRedemptionData & { id: string });
  getStatusBadge: (status: UmrahRedemptionData['status']) => React.ReactNode;
  getTierBadge: (tier: string) => React.ReactNode;
  handleViewDetails: (submission: UmrahRedemptionData & { id: string }) => void;
}

const RedemptionDetails = ({
  submission,
  getStatusBadge,
  getTierBadge,
  handleViewDetails
}: RedemptionDetailsProps) => {
  return (
    <div className="border-t p-4 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <h3 className="font-medium mb-2">Customer Information</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-cp-neutral-500">Name:</span> {submission.formData.name || 'N/A'}</div>
            <div><span className="text-cp-neutral-500">Email:</span> {submission.formData.email || 'N/A'}</div>
            <div><span className="text-cp-neutral-500">Country:</span> {submission.formData.country || 'N/A'}</div>
          </div>

          <h3 className="font-medium mb-2 mt-4">Package Details</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-cp-neutral-500">Package Type:</span>{' '}
              <span className="capitalize">{submission.tier}</span>
            </div>
            <div>
              <span className="text-cp-neutral-500">Credit Amount:</span>{' '}
              {submission.tokenAmount.toLocaleString()}
            </div>
            <div>
              <span className="text-cp-neutral-500">Submission Date:</span>{' '}
              {new Date(submission.timestamp).toLocaleDateString()}
            </div>
            <div>
              <span className="text-cp-neutral-500">Status:</span>{' '}
              {getStatusBadge(submission.status)}
            </div>
          </div>

          {submission.fileURL && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Passport/ID Document</h3>
              <PassportUploader
                userId={submission.userId}
                redemptionId={submission.id}
                onUploadComplete={() => {}}
                existingFileURL={submission.fileURL}
                readOnly
              />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div>
          <h3 className="font-medium mb-2">Travel Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-cp-neutral-500">Arrival City:</span> {submission.formData.arrival || 'N/A'}
            </div>
            <div>
              <span className="text-cp-neutral-500">Nights in Makkah:</span> {submission.formData.makkahNights || '—'}
            </div>
            <div>
              <span className="text-cp-neutral-500">Nights in Madinah:</span> {submission.formData.madinahNights || '—'}
            </div>
          </div>

          <h3 className="font-medium mb-2 mt-4">Admin Notes</h3>
          <div className="bg-white p-3 rounded-md border min-h-[80px] text-sm whitespace-pre-wrap">
            {submission.adminNotes?.trim() ? submission.adminNotes : (
              <span className="text-cp-neutral-400 italic">No notes added</span>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button 
              onClick={() => handleViewDetails(submission)}
              className="flex items-center gap-2"
              variant="default"
            >
              <Check size={16} />
              Update Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedemptionDetails;
