'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';
import ImageUpload from './ImageUpload';

interface PortfolioGalleryProps {
  images: string[];
  onAddImage: (url: string) => void;
  onRemoveImage: (url: string) => void;
}

export default function PortfolioGallery({ images, onAddImage, onRemoveImage }: PortfolioGalleryProps) {
  const [showUpload, setShowUpload] = useState(false);

  const handleImageUpload = (url: string) => {
    onAddImage(url);
    setShowUpload(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group aspect-square">
            <Image
              src={image}
              alt={`Portfolio ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemoveImage(image)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {/* Add New Button */}
        {!showUpload && (
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">Add Image</span>
          </button>
        )}
      </div>

      {showUpload && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <ImageUpload
            onImageUpload={handleImageUpload}
            currentImage=""
          />
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-2"
            onClick={() => setShowUpload(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Add photos from your portfolio, headshots, or previous work. Maximum 12 images.
      </p>
    </div>
  );
}

