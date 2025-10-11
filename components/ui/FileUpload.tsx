'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, File, Image } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface FileUploadProps {
  onUpload: (url: string) => void;
  type: 'casting-call' | 'application' | 'profile';
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({ onUpload, type, accept, maxSize, className }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (maxSize && file.size > maxSize) {
      alert(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await apiClient.post<{ success: boolean; data: { url: string } }>('/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const fileUrl = response.data.data.url;
        setUploadedFile(fileUrl);
        onUpload(fileUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAcceptString = () => {
    if (accept) return accept;
    switch (type) {
      case 'casting-call':
        return 'image/*,.pdf';
      case 'application':
        return 'image/*,.pdf';
      case 'profile':
        return 'image/*';
      default:
        return '*/*';
    }
  };

  const getMaxSizeMB = () => {
    if (maxSize) return maxSize / (1024 * 1024);
    switch (type) {
      case 'casting-call':
        return 10;
      case 'application':
        return 5;
      case 'profile':
        return 2;
      default:
        return 5;
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptString()}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      {!uploadedFile ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-dashed border-2 hover:border-primary"
        >
          <div className="flex flex-col items-center space-y-2">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {uploading ? 'Uploading...' : 'Click to upload file'}
              </p>
              <p className="text-xs text-muted-foreground">
                Max size: {getMaxSizeMB()}MB
              </p>
            </div>
          </div>
        </Button>
      ) : (
        <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50">
          <div className="flex-shrink-0" aria-label="File icon">
            {uploadedFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <Image className="h-8 w-8 text-blue-500" aria-hidden="true" />
            ) : (
              <File className="h-8 w-8 text-gray-500" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {uploadedFile.split('/').pop()}
            </p>
            <p className="text-xs text-muted-foreground">Uploaded successfully</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
