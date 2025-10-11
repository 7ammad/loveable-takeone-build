'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  MapPin,
  Calendar
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';

interface CastingCall {
  id: string;
  title: string;
  company?: string;
  location?: string;
  deadline?: string;
  description?: string;
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [castingCall, setCastingCall] = useState<CastingCall | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch casting call details
  useEffect(() => {
    async function fetchCastingCall() {
      try {
        const response = await apiClient.get<{ success: boolean; data: CastingCall }>(`/api/v1/casting-calls/${params.id}`);
        if (response.data.success) {
          setCastingCall(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch casting call:', err);
        setError('Failed to load casting call details');
      } finally {
        setLoading(false);
      }
    }

    fetchCastingCall();
  }, [params.id]);

  const handleApply = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      console.log('[Apply] Submitting application for casting call:', params.id);
      
      // One-click apply - all info comes from profile
      const response = await apiClient.post<{ success: boolean; data: { id: string }; error?: string }>('/api/v1/applications', {
        castingCallId: params.id,
      });

      console.log('[Apply] Response:', response.data);

      if (response.data.success) {
        setSubmitted(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Failed to submit application');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; details?: Array<{ message: string }> } }; message?: string };
      console.error('[Apply] Application submission error:', err);
      
      // Better error handling
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        const details = error.response.data.details.map((d) => d.message).join(', ');
        errorMessage = `Validation error: ${details}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-foreground">Confirm Application</h1>
            <p className="text-muted-foreground mt-2">
              Review the details and submit your application with one click
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading details...</p>
            </Card>
          ) : castingCall ? (
            <>
              {/* Casting Call Summary */}
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold text-foreground mb-4">You&apos;re applying for:</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{castingCall.title}</p>
                      {castingCall.company && (
                        <p className="text-sm text-muted-foreground">{castingCall.company}</p>
                      )}
                    </div>
                  </div>

                  {castingCall.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{castingCall.location}</p>
                    </div>
                  )}

                  {castingCall.deadline && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Application deadline: {new Date(castingCall.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {castingCall.description && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-foreground line-clamp-3">{castingCall.description}</p>
                  </div>
                )}
              </Card>

              {/* Info Card */}
              <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Your profile information will be sent
                    </p>
                    <p className="text-xs text-blue-700">
                      The casting director will see your profile, contact details, and portfolio. Make sure your profile is complete for the best results!
                    </p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <Card className="p-6 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-4">
                  By submitting this application, you confirm that all information in your profile is accurate and you agree to our Terms of Service.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/casting-calls/${params.id}`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleApply}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Apply Now
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-foreground font-semibold mb-2">Casting Call Not Found</p>
              <p className="text-muted-foreground mb-6">This casting call may have been removed or is no longer available.</p>
              <Link href="/casting-calls">
                <Button>Browse Other Opportunities</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

