'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api/client';
import { ArrowRight, ArrowLeft, CheckCircle2, User, Briefcase, FileText } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Talent-specific form data
  const [talentData, setTalentData] = useState({
    stageName: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    height: '',
    eyeColor: '',
    hairColor: '',
    skills: '',
    languages: '',
    portfolioUrl: '',
    demoReelUrl: '',
    instagramUrl: '',
  });

  // Caster-specific form data
  const [casterData, setCasterData] = useState({
    companyName: '',
    companyType: '',
    city: '',
    businessPhone: '',
    businessEmail: '',
    website: '',
    specializations: '',
  });

  const isTalent = user?.role === 'talent';
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleTalentChange = (field: string, value: string) => {
    setTalentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCasterChange = (field: string, value: string) => {
    setCasterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Basic validation before moving to next step
    if (currentStep === 1) {
      if (isTalent) {
        if (!talentData.stageName || !talentData.dateOfBirth || !talentData.gender || !talentData.city) {
          setError('Please fill in all required fields');
          return;
        }
      } else {
        if (!casterData.companyName || !casterData.companyType || !casterData.city) {
          setError('Please fill in all required fields');
          return;
        }
      }
    }

    if (currentStep === 2) {
      if (isTalent) {
        if (!talentData.skills || !talentData.languages) {
          setError('Please fill in all required fields');
          return;
        }
      } else {
        if (!casterData.businessPhone || !casterData.businessEmail) {
          setError('Please fill in all required fields');
          return;
        }
      }
    }

    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      if (isTalent) {
        // Create talent profile
        await apiClient.post<{ success: boolean }>('/profiles/talent', {
          ...talentData,
          height: talentData.height ? parseInt(talentData.height) : null,
          skills: talentData.skills.split(',').map((s) => s.trim()),
          languages: talentData.languages.split(',').map((l) => l.trim()),
        });
      } else {
        // Create caster profile
        await apiClient.post<{ success: boolean }>('/profiles/caster', {
          ...casterData,
          specializations: casterData.specializations.split(',').map((s) => s.trim()),
        });
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to create profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">Welcome to TakeOne!</CardTitle>
              <CardDescription className="mt-2">
                Let&apos;s set up your profile in just a few steps
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>

              {isTalent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stage Name *</label>
                    <Input
                      value={talentData.stageName}
                      onChange={(e) => handleTalentChange('stageName', e.target.value)}
                      placeholder="Your professional name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                    <Input
                      type="date"
                      value={talentData.dateOfBirth}
                      onChange={(e) => handleTalentChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Gender *</label>
                    <select
                      value={talentData.gender}
                      onChange={(e) => handleTalentChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <Input
                      value={talentData.city}
                      onChange={(e) => handleTalentChange('city', e.target.value)}
                      placeholder="e.g., Riyadh, Jeddah"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <Input
                      value={casterData.companyName}
                      onChange={(e) => handleCasterChange('companyName', e.target.value)}
                      placeholder="Your company or agency name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Type *</label>
                    <select
                      value={casterData.companyType}
                      onChange={(e) => handleCasterChange('companyType', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="">Select type</option>
                      <option value="production_company">Production Company</option>
                      <option value="advertising_agency">Advertising Agency</option>
                      <option value="independent">Independent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <Input
                      value={casterData.city}
                      onChange={(e) => handleCasterChange('city', e.target.value)}
                      placeholder="e.g., Riyadh, Jeddah"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Additional Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {isTalent ? 'Skills & Attributes' : 'Contact Details'}
                </h3>
              </div>

              {isTalent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Skills * (comma-separated)</label>
                    <Textarea
                      value={talentData.skills}
                      onChange={(e) => handleTalentChange('skills', e.target.value)}
                      placeholder="Acting, Dancing, Singing, etc."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Languages * (comma-separated)</label>
                    <Input
                      value={talentData.languages}
                      onChange={(e) => handleTalentChange('languages', e.target.value)}
                      placeholder="Arabic, English, French"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Height (cm)</label>
                    <Input
                      type="number"
                      value={talentData.height}
                      onChange={(e) => handleTalentChange('height', e.target.value)}
                      placeholder="e.g., 175"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Eye Color</label>
                      <Input
                        value={talentData.eyeColor}
                        onChange={(e) => handleTalentChange('eyeColor', e.target.value)}
                        placeholder="e.g., Brown"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hair Color</label>
                      <Input
                        value={talentData.hairColor}
                        onChange={(e) => handleTalentChange('hairColor', e.target.value)}
                        placeholder="e.g., Black"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Phone *</label>
                    <Input
                      value={casterData.businessPhone}
                      onChange={(e) => handleCasterChange('businessPhone', e.target.value)}
                      placeholder="+966 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Email *</label>
                    <Input
                      type="email"
                      value={casterData.businessEmail}
                      onChange={(e) => handleCasterChange('businessEmail', e.target.value)}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input
                      value={casterData.website}
                      onChange={(e) => handleCasterChange('website', e.target.value)}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Specializations (comma-separated)</label>
                    <Textarea
                      value={casterData.specializations}
                      onChange={(e) => handleCasterChange('specializations', e.target.value)}
                      placeholder="Film Production, Commercial Casting, etc."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Social & Portfolio */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {isTalent ? 'Portfolio & Social Media' : 'Review & Finish'}
                </h3>
              </div>

              {isTalent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Portfolio URL</label>
                    <Input
                      value={talentData.portfolioUrl}
                      onChange={(e) => handleTalentChange('portfolioUrl', e.target.value)}
                      placeholder="https://portfolio.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Demo Reel URL</label>
                    <Input
                      value={talentData.demoReelUrl}
                      onChange={(e) => handleTalentChange('demoReelUrl', e.target.value)}
                      placeholder="https://youtube.com/your-reel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Instagram URL</label>
                    <Input
                      value={talentData.instagramUrl}
                      onChange={(e) => handleTalentChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-2">Profile Summary</h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Company Name</dt>
                        <dd className="font-medium">{casterData.companyName}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Type</dt>
                        <dd className="font-medium">{casterData.companyType}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">City</dt>
                        <dd className="font-medium">{casterData.city}</dd>
                      </div>
                    </dl>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You can complete your profile later from the Settings page.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} disabled={isSubmitting}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

