import React, { useState } from 'react';
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
import { UmrahRedemptionData, getICBalance, logActivity, updateRedemptionStatus } from '@/utils/firestoreService';
import { useToast } from "@/hooks/use-toast";
import PassportUploader from '@/components/umrah/PassportUploader';

interface StatusUpdateDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  selectedSubmission: (UmrahRedemptionData & { id: string }) | null;
  newStatus: UmrahRedemptionData['status'];
  setNewStatus: (status: UmrahRedemptionData['status']) => void;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  handleStatusUpdate: () => void; // Still used for outer sync
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
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const { toast } = useToast();

  if (!selectedSubmission) return null;

  const closeAndReset = () => {
    setDialogOpen(false);
    setAdminNotes("");
    setNewStatus("pending");
  };

  const handleSubmit = async () => {
    if (!selectedSubmission) return;
    try {
      setLoading(true);
      await updateRedemptionStatus(selectedSubmission.id, newStatus, adminNotes);
      await logActivity("Admin updated redemption status", {
        userId: selectedSubmission.userId,
        redemptionId: selectedSubmission.id,
        newStatus,
        adminNotes,
      });
      toast({
        title: "Status updated",
        description: `Marked as ${newStatus}`,
      });
      handleStatusUpdate(); // Optional hook for parent refresh
      closeAndReset();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error updating status",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    const balance = await getICBalance(selectedSubmission.userId);
    setUserBalance(balance);
  };

  React.useEffect(() => {
    if (selectedSubmission?.userId) {
      fetchBalance();
    }
  }, [selectedSubmission?.userId]);

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
              <div><span className="text-cp-neutral-500">Name:</span> {selectedSubmission.formData.name}</div>
              <div><span className="text-cp-neutral-500">Email:</span> {selectedSubmission.formData.email}</div>
              <div><span className="text-cp-neutral-500">Country:</span> {selectedSubmission.formData.country}</div>
              {userBalance !== null && (
                <div>
                  <span className="text-cp-neutral-500">IC Balance:</span> {userBalance.toLocaleString()} Ihram Credits
                </div>
              )}
            </div>

            <h3 className="font-medium mb-2 mt-4">Package Details</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-cp-neutral-500">Package Type:</span> <span className="capitalize">{selectedSubmission.tier}</span></div>
              <div><span className="text-cp-neutral-500">Credit Amount:</span> {selectedSubmission.tokenAmount.toLocaleString()}</div>
              <div><span className="text-cp-neutral-500">Submission Date:</span> {new Date(selectedSubmission.timestamp).toLocaleDateString()}</div>
              <div><span className="text-cp-neutral-500">Status:</span> {getStatusBadge(selectedSubmission.status)}</div>
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
              <div><span className="text-cp-neutral-500">Arrival City:</span> {selectedSubmission.formData.arrival}</div>
              <div><span className="text-cp-neutral-500">Nights in Makkah:</span> {selectedSubmission.formData.makkahNights}</div>
              <div><span className="text-cp-neutral-500">Nights in Madinah:</span> {selectedSubmission.formData.madinahNights}</div>
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
          <Button variant="outline" onClick={closeAndReset} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateDialog;
