'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';

interface ApplicationFormProps {
  castingCallId: string;
  castingCallTitle: string;
  onSubmit?: (data: ApplicationData) => Promise<void>;
  onCancel?: () => void;
}

interface ApplicationData {
  castingCallId: string;
  coverLetter: string;
  availability: string;
  additionalInfo: string;
}

export default function ApplicationForm({ 
  castingCallId, 
  castingCallTitle, 
  onSubmit,
  onCancel 
}: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    coverLetter: '',
    availability: '',
    additionalInfo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const applicationData: ApplicationData = {
        castingCallId,
        ...formData,
      };

      if (onSubmit) {
        await onSubmit(applicationData);
      } else {
        // TODO: Default submit to API
        console.log('Submitting application:', applicationData);
      }
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Apply for: {castingCallTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cover Letter *
            </label>
            <textarea
              className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-foreground resize-y"
              placeholder="Tell us why you're a great fit for this role..."
              value={formData.coverLetter}
              onChange={(e) => updateFormData('coverLetter', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.coverLetter.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Availability *
            </label>
            <Input
              type="text"
              placeholder="e.g., Available immediately, Available from Nov 2025"
              value={formData.availability}
              onChange={(e) => updateFormData('availability', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Additional Information
            </label>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-foreground resize-y"
              placeholder="Any additional information you'd like to share..."
              value={formData.additionalInfo}
              onChange={(e) => updateFormData('additionalInfo', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={isSubmitting || !formData.coverLetter || !formData.availability}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
}

