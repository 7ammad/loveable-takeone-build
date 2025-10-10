'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { apiClient } from '@/lib/api/client';
import { ArrowLeft, Save, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface CastingCall {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  compensation: string;
  deadline: string;
  company?: string;
  projectType?: string;
  shootingDuration?: string;
  contactInfo?: string;
  status: string;
}

export default function EditCastingCallPage() {
  const router = useRouter();
  const params = useParams();
  const castingCallId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    compensation: '',
    deadline: '',
    company: '',
    projectType: '',
    shootingDuration: '',
    contactInfo: '',
    status: 'published',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch casting call data
  useEffect(() => {
    async function fetchCastingCall() {
      try {
        const response = await apiClient.get<{ success: boolean; data: CastingCall }>(`/api/v1/casting-calls/${castingCallId}`);
        const data = response.data;
        
        if (data.success && data.data) {
          const call = data.data;
          setFormData({
            title: call.title,
            description: call.description,
            requirements: call.requirements || '',
            location: call.location,
            compensation: call.compensation || '',
            deadline: call.deadline ? new Date(call.deadline).toISOString().split('T')[0] : '',
            company: call.company || '',
            projectType: call.projectType || '',
            shootingDuration: call.shootingDuration || '',
            contactInfo: call.contactInfo || '',
            status: call.status,
          });
        }
      } catch (err) {
        console.error('Failed to fetch casting call:', err);
        setError('Failed to load casting call. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    if (castingCallId) {
      fetchCastingCall();
    }
  }, [castingCallId]);

  const handleSubmit = async (e: React.FormEvent, status?: 'published' | 'draft') => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (status === 'draft') {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      // Prepare data based on status
      const submitData = {
        title: formData.title || (status === 'draft' ? 'Untitled Casting Call' : ''),
        description: formData.description || (status === 'draft' ? 'Draft description...' : ''),
        location: formData.location || (status === 'draft' ? 'TBD' : ''),
        requirements: formData.requirements || '',
        compensation: formData.compensation || '',
        deadline: formData.deadline || null,
        company: formData.company || '',
        projectType: formData.projectType || '',
        shootingDuration: formData.shootingDuration || '',
        contactInfo: formData.contactInfo || '',
        status: status || formData.status,
      };

      const response = await apiClient.patch<{ success: boolean; data: CastingCall }>(`/api/v1/casting-calls/${castingCallId}`, submitData);

      const data = response.data;
      if (data.success) {
        if (status === 'draft') {
          setSuccessMessage('Draft saved successfully! You can continue editing or publish it later.');
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          router.push(`/casting-calls/${castingCallId}`);
        }
      }
    } catch (err) {
      console.error('Failed to update casting call:', err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error 
        : 'Failed to update casting call. Please try again.';
      setError(errorMessage || 'Failed to update casting call. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    await handleSubmit(e, 'draft');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/v1/casting-calls/${castingCallId}`);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to delete casting call:', err);
      setError('Failed to delete casting call. Please try again.');
      setIsDeleting(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="caster">
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="caster">
      <div className="min-h-screen bg-background">
        <DashboardNav />
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Edit Casting Call</h1>
                <p className="text-muted-foreground mt-1">Update your casting call details</p>
              </div>
              <div className="flex gap-3">
                <Link href={`/casting-calls/${castingCallId}`}>
                  <Button variant="outline" disabled={isSubmitting || isSavingDraft}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleSaveDraft} 
                  disabled={isSubmitting || isSavingDraft}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || isSavingDraft}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Updating...' : 'Update'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your casting call and all associated applications.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
                {successMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Role Title *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      placeholder="e.g. Lead Actor for Historical Drama"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Project Type *
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                        value={formData.projectType}
                        onChange={(e) => updateFormData('projectType', e.target.value)}
                        required
                      >
                        <option value="">Select type</option>
                        <option value="tv_series">TV Series</option>
                        <option value="film">Film</option>
                        <option value="commercial">Commercial</option>
                        <option value="theater">Theater</option>
                        <option value="voice_acting">Voice Acting</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Location *
                      </label>
                      <Input
                        value={formData.location}
                        onChange={(e) => updateFormData('location', e.target.value)}
                        placeholder="e.g. Riyadh"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company
                      </label>
                      <Input
                        value={formData.company}
                        onChange={(e) => updateFormData('company', e.target.value)}
                        placeholder="e.g. MBC Studios"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Compensation
                      </label>
                      <Input
                        value={formData.compensation}
                        onChange={(e) => updateFormData('compensation', e.target.value)}
                        placeholder="e.g. 5000 SAR, Negotiable"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Compensation Range *
                      </label>
                      <Input
                        value={formData.compensation}
                        onChange={(e) => updateFormData('compensation', e.target.value)}
                        placeholder="e.g. SAR 50,000 - 80,000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Application Deadline *
                      </label>
                      <Input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => updateFormData('deadline', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                      value={formData.status}
                      onChange={(e) => updateFormData('status', e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Project Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-foreground resize-y"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Provide a detailed description of the role and project..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Include project overview, storyline, production details, and any other relevant information.
                  </p>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role Requirements *
                  </label>
                  <textarea
                    className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-foreground resize-y"
                    value={formData.requirements}
                    onChange={(e) => updateFormData('requirements', e.target.value)}
                    placeholder="List all requirements (age, gender, skills, experience, etc.)"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use bullet points for better readability. Include age range, gender, specific skills, and experience level.
                  </p>
                </CardContent>
              </Card>

              {/* Production Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Production Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Shooting Duration
                    </label>
                    <Input
                      value={formData.shootingDuration}
                      onChange={(e) => updateFormData('shootingDuration', e.target.value)}
                      placeholder="e.g. 6 months, 3 weeks, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contact Information *
                    </label>
                    <Input
                      value={formData.contactInfo}
                      onChange={(e) => updateFormData('contactInfo', e.target.value)}
                      placeholder="Email or phone number for inquiries"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

