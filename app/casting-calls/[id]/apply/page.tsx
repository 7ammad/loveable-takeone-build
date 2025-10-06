'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { uploadFile, validateFile } from '@/lib/utils/upload-client';
import { apiClient } from '@/lib/api/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({
    headshot: 0,
    portfolio: 0,
  });

  const [formData, setFormData] = useState({
    coverLetter: '',
    availability: '',
    contactPhone: '',
    portfolio: null as File | null,
    headshot: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.coverLetter || formData.coverLetter.length < 100) {
        throw new Error('Cover letter must be at least 100 characters');
      }
      if (!formData.availability) {
        throw new Error('Availability is required');
      }
      if (!formData.contactPhone) {
        throw new Error('Contact phone is required');
      }
      if (!formData.headshot) {
        throw new Error('Headshot is required');
      }

      // Validate files
      const headshotValidation = validateFile(formData.headshot);
      if (!headshotValidation.valid) {
        throw new Error(headshotValidation.error);
      }

      if (formData.portfolio) {
        const portfolioValidation = validateFile(formData.portfolio);
        if (!portfolioValidation.valid) {
          throw new Error(portfolioValidation.error);
        }
      }

      // Step 1: Upload headshot
      const headshotResult = await uploadFile(formData.headshot, (progress) => {
        setUploadProgress(prev => ({ ...prev, headshot: progress.percentage }));
      });

      // Step 2: Upload portfolio (if provided)
      let portfolioResult = null;
      if (formData.portfolio) {
        portfolioResult = await uploadFile(formData.portfolio, (progress) => {
          setUploadProgress(prev => ({ ...prev, portfolio: progress.percentage }));
        });
      }

      // Step 3: Submit application
      const response = await apiClient.post<{ success: boolean; data: { id: string } }>('/applications', {
        castingCallId: params.id,
        coverLetter: formData.coverLetter,
        availability: formData.availability,
        contactPhone: formData.contactPhone,
        headshotUrl: headshotResult.objectUrl,
        portfolioUrl: portfolioResult?.objectUrl || '',
      });

      if (response.data.success) {
        setSubmitted(true);
        setTimeout(() => {
          router.push('/applications');
        }, 2000);
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <ProtectedRoute requiredRole="talent">
        <DashboardNav />
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Your application has been successfully submitted. The casting director will review it and get back to you soon.
          </p>
          <Link href="/applications">
            <Button className="w-full">View My Applications</Button>
          </Link>
        </Card>
      </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="talent">
      <DashboardNav />
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link href={`/casting-calls/${params.id}`} className="inline-flex items-center text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Casting Call
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Apply for This Role</h1>
          <p className="text-muted-foreground mt-2">
            Complete your application below. All fields are required.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Letter */}
          <Card className="p-6">
            <label htmlFor="coverLetter" className="block text-sm font-medium text-foreground mb-2">
              Cover Letter *
            </label>
            <Textarea
              id="coverLetter"
              rows={6}
              value={formData.coverLetter}
              onChange={(e) => updateFormData('coverLetter', e.target.value)}
              placeholder="Tell us why you're a great fit for this role..."
              className="resize-none"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Minimum 100 characters
            </p>
          </Card>

          {/* Availability */}
          <Card className="p-6">
            <label htmlFor="availability" className="block text-sm font-medium text-foreground mb-2">
              Availability *
            </label>
            <Textarea
              id="availability"
              rows={3}
              value={formData.availability}
              onChange={(e) => updateFormData('availability', e.target.value)}
              placeholder="When are you available? (e.g., Weekdays after 5 PM, Weekends, etc.)"
              className="resize-none"
              required
              disabled={isSubmitting}
            />
          </Card>

          {/* Contact Phone */}
          <Card className="p-6">
            <label htmlFor="contactPhone" className="block text-sm font-medium text-foreground mb-2">
              Contact Phone Number *
            </label>
            <Input
              id="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => updateFormData('contactPhone', e.target.value)}
              placeholder="+966 5X XXX XXXX"
              required
              disabled={isSubmitting}
            />
          </Card>

              {/* File Uploads */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Supporting Materials</h3>
                
                {/* Headshot */}
                <div className="mb-4">
                  <label htmlFor="headshot" className="block text-sm font-medium text-foreground mb-2">
                    Recent Headshot *
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WebP up to 5MB
                    </p>
                    <input
                      id="headshot"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          updateFormData('headshot', e.target.files[0]);
                        }
                      }}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  {formData.headshot && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {formData.headshot.name}
                      </p>
                      {isSubmitting && uploadProgress.headshot > 0 && uploadProgress.headshot < 100 && (
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress.headshot}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{uploadProgress.headshot}% uploaded</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Portfolio/Reel */}
                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium text-foreground mb-2">
                    Portfolio or Demo Reel (Optional)
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP4, QuickTime, AVI up to 100MB
                    </p>
                    <input
                      id="portfolio"
                      type="file"
                      accept="video/mp4,video/quicktime,video/x-msvideo"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          updateFormData('portfolio', e.target.files[0]);
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                  {formData.portfolio && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {formData.portfolio.name}
                      </p>
                      {isSubmitting && uploadProgress.portfolio > 0 && uploadProgress.portfolio < 100 && (
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress.portfolio}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{uploadProgress.portfolio}% uploaded</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

          {/* Submit Section */}
          <Card className="p-6 bg-muted/30">
            <p className="text-sm text-muted-foreground mb-4">
              By submitting this application, you confirm that all information provided is accurate and you agree to our Terms of Service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/casting-calls/${params.id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading & Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
            </div>
          </Card>
        </form>
      </div>
      </div>
    </ProtectedRoute>
  );
}

