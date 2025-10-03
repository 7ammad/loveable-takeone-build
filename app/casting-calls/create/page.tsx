'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';

export default function CreateCastingCallPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    compensation: '',
    deadline: '',
    projectType: '',
    shootingDuration: '',
    contactInfo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log('Submitting:', formData);
    router.push('/dashboard');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ProtectedRoute requiredRole="caster">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-background border-b">
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
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
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
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

