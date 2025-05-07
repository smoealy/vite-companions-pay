
import React, { useState } from 'react';
import { Upload, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface PassportUploaderProps {
  userId: string;
  redemptionId: string;
  onUploadComplete: (url: string) => void;
  existingFileURL?: string | null;
  readOnly?: boolean;
}

const PassportUploader: React.FC<PassportUploaderProps> = ({ 
  userId, 
  redemptionId, 
  onUploadComplete,
  existingFileURL = null,
  readOnly = false
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Check file size (max 5MB)
      if (e.target.files[0].size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const storage = getStorage();
      const fileRef = ref(storage, `users/${userId}/redemptions/${redemptionId}/passport${file.name.substring(file.name.lastIndexOf('.'))}`);
      
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      
      onUploadComplete(downloadUrl);
      
      toast({
        title: "Upload Complete",
        description: "Your passport/photo has been uploaded successfully"
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  if (readOnly && existingFileURL) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.open(existingFileURL, '_blank')}
        className="flex items-center gap-2"
      >
        <ExternalLink size={16} />
        View Passport/ID
      </Button>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input 
          id="passport" 
          type="file" 
          accept="image/jpeg,image/png,application/pdf" 
          onChange={handleFileChange}
          disabled={uploading || readOnly}
          className="max-w-sm"
        />
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading || readOnly}
          size="sm"
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      <p className="text-xs text-cp-neutral-500">
        Optional: Upload a copy of your passport or photo ID (max 5MB)
      </p>
    </div>
  );
};

export default PassportUploader;
