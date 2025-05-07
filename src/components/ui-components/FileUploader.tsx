
import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "../../../contexts/UserContext";

import { Button } from "@/components/ui/button";
import { storage } from "@/firebaseConfig";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onUploadComplete?: (url: string) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
  folderPath?: string;
}

const FileUploader = ({
  onUploadComplete,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxSizeMB = 5,
  folderPath = 'uploads'
}: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const { user } = useUser();
  const { toast } = useToast();
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (!selectedFile) return;
    
    // Check file type
    if (allowedTypes.length && !allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload one of the following: ${allowedTypes.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !user) {
      toast({
        title: "Upload failed",
        description: !file ? "Please select a file first" : "You need to be signed in to upload files",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Create a unique file name to prevent overwrites
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      
      // Set storage path - users/{uid}/folderPath/filename
      const storagePath = `users/${user.uid}/${folderPath}/${fileName}`;
      const storageRef = ref(storage, storagePath);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const url = await getDownloadURL(storageRef);
      
      setDownloadURL(url);
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(url);
      }
      
      toast({
        title: "Upload successful",
        description: "Your file has been uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label 
          htmlFor="file-upload" 
          className="mb-2 text-sm font-medium text-cp-neutral-700"
        >
          Upload file
        </label>
        <input 
          id="file-upload"
          type="file" 
          onChange={handleFileChange}
          className="block text-sm text-cp-neutral-700 
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-medium
                     file:bg-cp-green-50 file:text-cp-green-700
                     hover:file:bg-cp-green-100
                     cursor-pointer"
          disabled={uploading}
        />
        {file && (
          <p className="mt-1 text-sm text-cp-neutral-500">
            Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
          </p>
        )}
      </div>
      
      <Button 
        onClick={handleUpload} 
        disabled={!file || uploading}
        className="flex gap-2"
      >
        <Upload size={16} />
        {uploading ? 'Uploading...' : 'Upload File'}
      </Button>
      
      {downloadURL && (
        <div className="mt-4 p-3 bg-cp-green-50 rounded-md">
          <p className="text-sm text-cp-green-700 font-medium">File uploaded successfully!</p>
          <p className="text-xs text-cp-neutral-600 break-all mt-1">
            File URL: <a href={downloadURL} target="_blank" rel="noreferrer" className="text-cp-green-600 hover:underline">{downloadURL}</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
