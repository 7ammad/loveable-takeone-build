'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { ArrowLeft, Save, Eye, Sparkles, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { TemplateSelector } from '@/components/casting/TemplateSelector';
import { type CastingTemplate } from '@/lib/casting-templates';

export default function CreateCastingCallPage() {
  const router = useRouter();
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
    attachments: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent, status: 'published' | 'draft' = 'published') => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (status === 'published') {
      setIsSubmitting(true);
    } else {
      setIsSavingDraft(true);
    }

    try {
      // Prepare data based on status
      const submitData: Record<string, string | string[] | null> = {
        title: formData.title || (status === 'draft' ? 'Untitled Casting Call' : ''),
        status: status,
      };

      // Only include optional fields if they have values
      if (formData.description) submitData.description = formData.description;
      if (formData.location) submitData.location = formData.location;
      if (formData.requirements) submitData.requirements = formData.requirements;
      if (formData.compensation) submitData.compensation = formData.compensation;
      if (formData.deadline) submitData.deadline = formData.deadline;
      if (formData.company) submitData.company = formData.company;
      if (formData.projectType) submitData.projectType = formData.projectType;
      if (formData.shootingDuration) submitData.shootingDuration = formData.shootingDuration;
      if (formData.contactInfo) submitData.contactInfo = formData.contactInfo;
      if (formData.attachments && formData.attachments.length > 0) submitData.attachments = formData.attachments;

      const response = await apiClient.post<{ success: boolean; data: { id: string } }>('/api/v1/casting-calls', submitData);

      const data = response.data;
      if (data.success) {
        if (status === 'published') {
          router.push(`/casting-calls/${data.data.id}`);
        } else {
          // Show success message for draft
          setSuccessMessage('Draft saved successfully! You can continue editing or publish it later.');
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      }
    } catch (err) {
      console.error('Failed to create casting call:', err);
      
      // Better error handling
      let errorMessage = 'Failed to create casting call. Please try again.';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { error?: string; details?: unknown[] } } };
        
        // Handle 403 Forbidden (wrong role)
        if (axiosError.response?.status === 403) {
          errorMessage = 'Access denied. Only casters can create casting calls. Please log in with a caster account.';
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
          
          // If there are validation details, show them
          if (axiosError.response.data.details && Array.isArray(axiosError.response.data.details)) {
            const details = (axiosError.response.data.details as Array<{ message?: string }>).map((d) => d.message).join(', ');
            errorMessage += `: ${details}`;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    await handleSubmit(e, 'draft');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template: CastingTemplate | null) => {
    if (template) {
      setFormData({
        title: template.template.title,
        description: template.template.description,
        requirements: template.template.requirements,
        location: template.template.location,
        compensation: template.template.compensation,
        deadline: '',
        company: template.template.company,
        projectType: template.template.projectType.toLowerCase().replace(' ', '_'),
        shootingDuration: template.template.shootingDuration,
        contactInfo: template.template.contactInfo,
        attachments: [],
      });
    }
    setShowTemplateSelector(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          setError(`File "${file.name}" has an invalid type. Only images (JPG, PNG, GIF) and PDFs are allowed.`);
          continue;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }

        // Upload file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'casting-call');

        const response = await apiClient.post<{ success: boolean; data: { url: string } }>('/api/v1/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          uploadedUrls.push(response.data.data.url);
        }
      }

      // Add uploaded URLs to form data
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedUrls],
      }));

      if (uploadedUrls.length > 0) {
        setSuccessMessage(`${uploadedUrls.length} file(s) uploaded successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

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
                <h1 className="text-3xl font-bold text-foreground">Create Casting Call</h1>
                <p className="text-muted-foreground mt-1">Post a new opportunity for talent</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTemplateSelector(true)}
                  disabled={isSubmitting || isSavingDraft}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Templates
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={isSubmitting || isSavingDraft}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSaveDraft} 
                  disabled={isSubmitting || isSavingDraft}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || isSavingDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Publishing...' : 'Publish'}
                </Button>
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
            {!showPreview ? (
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

              {/* File Attachments */}
              <Card>
                <CardHeader>
                  <CardTitle>Attachments (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Upload Images or Documents
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Add reference images, mood boards, character sheets, or project briefs. Max 10MB per file.
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/jpeg,image/png,image/gif,application/pdf"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Choose Files'}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Images (JPG, PNG, GIF) or PDF
                      </span>
                    </div>

                    {/* Uploaded Files List */}
                    {formData.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium">Uploaded Files ({formData.attachments.length})</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {formData.attachments.map((url, index) => {
                            const fileName = url.split('/').pop() || 'file';
                            const isPdf = url.toLowerCase().endsWith('.pdf');
                            
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 border rounded-md bg-muted/50"
                              >
                                {isPdf ? (
                                  <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                )}
                                <span className="text-sm flex-1 truncate" title={fileName}>
                                  {fileName}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAttachment(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Publish Casting Call
                </Button>
              </div>
            </form>
            ) : (
              /* Preview Mode */
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{formData.title || 'Untitled Casting Call'}</CardTitle>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setShowPreview(false)}
                      >
                        Back to Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Project Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.projectType && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Project Type</h3>
                          <p className="text-foreground capitalize">{formData.projectType.replace('_', ' ')}</p>
                        </div>
                      )}
                      {formData.location && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Location</h3>
                          <p className="text-foreground">{formData.location}</p>
                        </div>
                      )}
                      {formData.company && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Company</h3>
                          <p className="text-foreground">{formData.company}</p>
                        </div>
                      )}
                      {formData.compensation && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Compensation</h3>
                          <p className="text-foreground">{formData.compensation}</p>
                        </div>
                      )}
                      {formData.shootingDuration && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Shooting Duration</h3>
                          <p className="text-foreground">{formData.shootingDuration}</p>
                        </div>
                      )}
                      {formData.deadline && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Application Deadline</h3>
                          <p className="text-foreground">{new Date(formData.deadline).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {formData.description && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
                        <p className="text-foreground whitespace-pre-wrap">{formData.description}</p>
                      </div>
                    )}

                    {/* Requirements */}
                    {formData.requirements && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Requirements</h3>
                        <p className="text-foreground whitespace-pre-wrap">{formData.requirements}</p>
                      </div>
                    )}

                    {/* Contact Info */}
                    {formData.contactInfo && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Contact Information</h3>
                        <p className="text-foreground whitespace-pre-wrap">{formData.contactInfo}</p>
                      </div>
                    )}

                    {/* Attachments */}
                    {formData.attachments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Attachments ({formData.attachments.length})</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {formData.attachments.map((url, index) => {
                            const fileName = url.split('/').pop() || 'file';
                            const isPdf = url.toLowerCase().endsWith('.pdf');
                            
                            return (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                              >
                                {isPdf ? (
                                  <FileText className="w-6 h-6 text-red-500 flex-shrink-0" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                                )}
                                <span className="text-sm flex-1 truncate" title={fileName}>
                                  {fileName}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button 
                        type="button"
                        onClick={(e) => {
                          setShowPreview(false);
                          handleSubmit(e as unknown as React.FormEvent, 'published');
                        }}
                        disabled={isSubmitting || isSavingDraft}
                        className="flex-1"
                      >
                        {isSubmitting ? 'Publishing...' : 'Publish Casting Call'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={(e) => {
                          setShowPreview(false);
                          handleSaveDraft(e as unknown as React.FormEvent);
                        }}
                        disabled={isSubmitting || isSavingDraft}
                      >
                        {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Template Selector Modal */}
        {showTemplateSelector && (
          <TemplateSelector
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

