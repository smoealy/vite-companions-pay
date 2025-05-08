import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SafariWarningModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unsupported on Mobile Safari</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Buying tokens is not supported on Safari mobile browser due to Apple’s restrictions.
          Please open this site inside the MetaMask or Trust Wallet browser, or use a desktop browser.
        </p>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
