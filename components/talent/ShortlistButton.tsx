'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ShortlistButtonProps {
  talentId: string;
  isShortlisted?: boolean;
  onShortlistChange?: (isShortlisted: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ShortlistButton({ 
  talentId, 
  isShortlisted = false, 
  onShortlistChange,
  size = 'md' 
}: ShortlistButtonProps) {
  const [loading, setLoading] = useState(false);
  const [shortlisted, setShortlisted] = useState(isShortlisted);

  const handleShortlist = async () => {
    setLoading(true);
    try {
      if (shortlisted) {
        // Remove from shortlist
        await apiClient.delete(`/api/v1/talent/shortlist/${talentId}`);
        setShortlisted(false);
        onShortlistChange?.(false);
      } else {
        // Add to shortlist
        await apiClient.post('/api/v1/talent/shortlist', {
          talentUserId: talentId,
          notes: '',
          tags: [],
        });
        setShortlisted(true);
        onShortlistChange?.(true);
      }
    } catch (error) {
      console.error('Failed to update shortlist:', error);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <Button
      variant={shortlisted ? 'default' : 'outline'}
      size="icon"
      onClick={handleShortlist}
      disabled={loading}
      className={`${sizeClasses[size]} ${
        shortlisted 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'hover:bg-red-50 hover:border-red-300'
      }`}
    >
      {loading ? (
        <Loader2 className={`h-${iconSizes[size] / 4} w-${iconSizes[size] / 4} animate-spin`} />
      ) : shortlisted ? (
        <Heart className={`h-${iconSizes[size] / 4} w-${iconSizes[size] / 4} fill-current`} />
      ) : (
        <HeartOff className={`h-${iconSizes[size] / 4} w-${iconSizes[size] / 4}`} />
      )}
    </Button>
  );
}
