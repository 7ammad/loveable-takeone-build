'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export default function ImageUpload({ 
  onImageUpload, 
  currentImage = '', 
  aspectRatio = 'square' 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      // TODO: Implement actual upload to server/cloud storage
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch('/api/upload', { method: 'POST', body: formData });
      // const data = await response.json();
      // onImageUpload(data.url);
      
      // Mock upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockUrl = URL.createObjectURL(file);
      onImageUpload(mockUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-video',
  }[aspectRatio];

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <div className={`${aspectRatioClass} w-full max-w-xs mx-auto overflow-hidden rounded-lg border`}>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className={`${aspectRatioClass} w-full max-w-xs mx-auto border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/10`}>
          <div className="text-center p-4">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">No image selected</p>
            <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
      </Button>
    </div>
  );
}

