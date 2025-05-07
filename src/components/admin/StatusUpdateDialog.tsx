
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UmrahRedemptionData } from '@/utils/firestoreService';
import PassportUploader from '@/components/umrah/PassportUploader';

interface StatusUpdateDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  selectedSubmission: (UmrahRedemptionData & { id: string }) | null;
  newStatus: UmrahRedemptionData['status'];
  setNewStatus: (status: UmrahRedemptionData['status']) => void;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  handleStatusUpdate: () => void;
  getStatusBadge: (status: UmrahRedemptionData['status']) => React.ReactNode;
}

const StatusUpdateDialog = ({
  dialogOpen,
  setDialogOpen,
  selectedSubmission,
  newStatus,
  setNewStatus,
  adminNotes,
  setAdminNotes,
  handleStatusUpdate,
  getStatusBadge
}: StatusUpdateDialogProps) => {
  if (!selectedSubmission) return null;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Submission Status</DialogTitle>
          <DialogDescription>
            Change the status and add notes for this submission
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <h3 className="font-medium mb-2">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-cp-neutral-500">Name:</span> {selectedSubmission.formData.name}
              </div>
              <div>
                <span className="text-cp-neutral-500">Email:</span> {selectedSubmission.formData.email}
              </div>
              <div>
                <span className="text-cp-neutral-500">Country:</span> {selectedSubmission.formData.country}
              </div>
            </div>
            
            <h3 className="font-medium mb-2 mt-4">Package Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-cp-neutral-500">Package Type:</span> <span className="capitalize">{selectedSubmission.tier}</span>
              </div>
              <div>
                <span className="text-cp-neutral-500">Credit Amount:</span> {selectedSubmission.tokenAmount.toLocaleString()}
              </div>
              <div>
                <span className="text-cp-neutral-500">Submission Date:</span> {new Date(selectedSubmission.timestamp).toLocaleDateString()}
              </div>
              <div>
                <span className="text-cp-neutral-500">Status:</span> {getStatusBadge(selectedSubmission.status)}
              </div>
            </div>
            
            {selectedSubmission.fileURL && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Passport/ID Document</h3>
                <PassportUploader
                  userId={selectedSubmission.userId}
                  redemptionId={selectedSubmission.id}
                  onUploadComplete={() => {}}
                  existingFileURL={selectedSubmission.fileURL}
                  readOnly={true}
                />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Travel Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-cp-neutral-500">Arrival City:</span> {selectedSubmission.formData.arrival}
              </div>
              <div>
                <span className="text-cp-neutral-500">Nights in Makkah:</span> {selectedSubmission.formData.makkahNights}
              </div>
              <div>
                <span className="text-cp-neutral-500">Nights in Madinah:</span> {selectedSubmission.formData.madinahNights}
              </div>
            </div>
            
            <h3 className="font-medium mb-2 mt-4">Admin Actions</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm text-cp-neutral-500">Update Status</label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as UmrahRedemptionData['status'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm text-cp-neutral-500">Admin Notes</label>
                <Textarea 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this submission..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateDialog;
