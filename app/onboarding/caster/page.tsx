'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { CASTER_TAXONOMY, COMPANY_SIZE_OPTIONS } from '@/lib/constants/caster-taxonomy';
import DynamicCasterForm from '@/components/profile/caster/DynamicCasterForm';

type OnboardingStep = 'welcome' | 'type' | 'basic' | 'optional' | 'success';

interface FormData {
  companyType: string;
  companyCategory: string;
  companyNameEn: string;
  companyNameAr: string;
  city: string;
  businessPhone: string;
  businessEmail: string;
  companySize: string;
  establishedYear: string;
  website: string;
}

interface CustomFields {
  [key: string]: string | number | boolean | string[] | null;
}

export default function CasterOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    companyType: '',
    companyCategory: '',
    companyNameEn: '',
    companyNameAr: '',
    city: '',
    businessPhone: '',
    businessEmail: user?.email || '',
    companySize: '',
    establishedYear: '',
    website: '',
  });

  const [customFields, setCustomFields] = useState<CustomFields>({});
  const [casterStructure, setCasterStructure] = useState<'independent' | 'company' | ''>('');

  useEffect(() => {
    // Redirect non-casters
    if (user && user.role !== 'caster') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const updateCustomField = (field: string, value: string | number | boolean | string[] | null) => {
    setCustomFields(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleTypeSubmit = () => {
    if (!casterStructure) {
      setError('Please select if you are independent or a company');
      return;
    }
    if (!formData.companyType) {
      setError('Please select your caster type');
      return;
    }
    setCurrentStep('basic');
  };

  const handleBasicInfoNext = () => {
    // Validate required fields
    if (!formData.companyNameEn || !formData.city || !formData.businessPhone || !formData.businessEmail) {
      setError('Please fill in all required fields');
      return;
    }
    setCurrentStep('optional');
  };

  const handleSubmit = async (skipOptional = false) => {
    try {
      setLoading(true);
      setError('');

      // Get profile ID first
      const { data: profilesResponse } = await apiClient.get<{ data: { profiles: { id: string }[] } }>(
        '/api/v1/caster-profiles?limit=1'
      );

      if (!profilesResponse.data.profiles.length) {
        throw new Error('Profile not found');
      }

      const profileId = profilesResponse.data.profiles[0].id;

      // Prepare data
      const payload: Record<string, string | number | Record<string, string | number | boolean | string[] | null>> = {
        companyNameEn: formData.companyNameEn,
        companyType: formData.companyType,
        companyCategory: formData.companyCategory,
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail,
        city: formData.city,
      };

      // Add custom type-specific fields if any
      if (Object.keys(customFields).length > 0) {
        payload.typeSpecificFields = customFields;
      }

      // Add optional fields if not skipping
      if (!skipOptional) {
        if (formData.companyNameAr) payload.companyNameAr = formData.companyNameAr;
        if (formData.companySize) payload.companySize = formData.companySize;
        if (formData.establishedYear) payload.establishedYear = parseInt(formData.establishedYear);
        if (formData.website) payload.website = formData.website;
      }

      // Update profile
      await apiClient.patch(`/api/v1/caster-profiles/${profileId}`, payload);

      setCurrentStep('success');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Onboarding error:', err);
      setError(error.response?.data?.error || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipOptional = () => {
    handleSubmit(true);
  };

  if (!user || user.role !== 'caster') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        
        {/* Progress Indicator */}
        {currentStep !== 'welcome' && currentStep !== 'success' && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['type', 'basic', 'optional'].map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === step
                        ? 'bg-primary text-primary-foreground'
                        : ['type', 'basic', 'optional'].indexOf(currentStep) > index
                        ? 'bg-primary/50 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        ['type', 'basic', 'optional'].indexOf(currentStep) > index
                          ? 'bg-primary/50'
                          : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Company Type</span>
              <span>Basic Info</span>
              <span>Optional</span>
            </div>
          </div>
        )}

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl mb-2">Welcome to TakeOne! 🎬</CardTitle>
              <CardDescription className="text-base">
                Let&apos;s set up your company profile to start discovering talent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Tell Us About You</h4>
                  <p className="text-sm text-muted-foreground">Share your company details</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Discover Talent</h4>
                  <p className="text-sm text-muted-foreground">Browse thousands of profiles</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Start Hiring</h4>
                  <p className="text-sm text-muted-foreground">Post jobs and manage applications</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => setCurrentStep('type')} 
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  This will only take 2-3 minutes
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Type Selection Step */}
        {currentStep === 'type' && (
          <Card>
            <CardHeader>
              <CardTitle>What type of caster are you?</CardTitle>
              <CardDescription>
                Tell us about your casting business structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Step 1: Independent or Company */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">I am a/an</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setCasterStructure('independent');
                      updateFormData('companyCategory', 'corporate');
                      updateFormData('companyType', 'independent_producer');
                      updateFormData('companySize', 'freelance');
                    }}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      casterStructure === 'independent'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Independent Caster</h4>
                        <p className="text-xs text-muted-foreground">
                          Freelance producer, director, or casting professional
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCasterStructure('company');
                      // Don't auto-set type for companies
                      updateFormData('companyType', '');
                      updateFormData('companyCategory', '');
                    }}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      casterStructure === 'company'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Company</h4>
                        <p className="text-xs text-muted-foreground">
                          Production company, agency, or organization
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Company Type Selection (only if company) */}
              {casterStructure === 'company' && (
                <div className="space-y-3">
                  <Label htmlFor="companyType" className="text-base font-semibold">
                    Company Type <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="companyType"
                    value={formData.companyType}
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      updateFormData('companyType', selectedType);
                      // Find and set category
                      const category = Object.entries(CASTER_TAXONOMY).find(([, cat]) =>
                        Object.keys(cat.types).includes(selectedType)
                      );
                      if (category) {
                        updateFormData('companyCategory', category[0]);
                      }
                    }}
                    className="w-full h-12 rounded-md border border-input bg-background px-4 py-2 text-sm"
                  >
                    <option value="">Select your company type...</option>
                    {Object.entries(CASTER_TAXONOMY)
                      .filter(([key]) => key !== 'corporate') // Exclude corporate category for companies
                      .map(([categoryKey, category]) => (
                        <optgroup key={categoryKey} label={category.label_en}>
                          {Object.entries(category.types).map(([typeKey, type]) => (
                            <option key={typeKey} value={typeKey}>
                              {type.label_en}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                  {formData.companyType && (
                    <p className="text-xs text-muted-foreground">
                      {CASTER_TAXONOMY[formData.companyCategory]?.types[formData.companyType]?.description}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('welcome')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleTypeSubmit}
                  className="flex-1"
                  disabled={!casterStructure || (casterStructure === 'company' && !formData.companyType)}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Info Step */}
        {currentStep === 'basic' && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Tell us about {casterStructure === 'independent' ? 'yourself' : 'your company'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyNameEn">
                    {casterStructure === 'independent' ? 'Professional Name' : 'Company Name'} (English) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="companyNameEn"
                      value={formData.companyNameEn}
                      onChange={(e) => updateFormData('companyNameEn', e.target.value)}
                      className="pl-10"
                      placeholder={casterStructure === 'independent' ? 'e.g. Ahmed Al-Saud' : 'e.g. Riyadh Productions'}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyNameAr">
                    {casterStructure === 'independent' ? 'Professional Name' : 'Company Name'} (Arabic)
                  </Label>
                  <Input
                    id="companyNameAr"
                    value={formData.companyNameAr}
                    onChange={(e) => updateFormData('companyNameAr', e.target.value)}
                    className="text-right"
                    placeholder={casterStructure === 'independent' ? 'مثال: أحمد السعود' : 'مثال: إنتاج الرياض'}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="pl-10"
                      placeholder="e.g. Riyadh"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone">
                    Business Phone <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="businessPhone"
                      value={formData.businessPhone}
                      onChange={(e) => updateFormData('businessPhone', e.target.value)}
                      className="pl-10"
                      placeholder="+966 50 123 4567"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessEmail">
                  Business Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => updateFormData('businessEmail', e.target.value)}
                    className="pl-10"
                    placeholder="contact@company.com"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Type-Specific Fields */}
              {formData.companyType && (
                <DynamicCasterForm
                  companyType={formData.companyType}
                  formData={customFields}
                  onChange={updateCustomField}
                />
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('type')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleBasicInfoNext}
                  className="flex-1"
                  disabled={loading}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optional Details Step */}
        {currentStep === 'optional' && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Details (Optional)</CardTitle>
              <CardDescription>
                Help us understand your company better - you can skip this and add later
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <select
                    id="companySize"
                    value={formData.companySize}
                    onChange={(e) => updateFormData('companySize', e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="establishedYear"
                      type="number"
                      value={formData.establishedYear}
                      onChange={(e) => updateFormData('establishedYear', e.target.value)}
                      className="pl-10"
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="https://www.company.com"
                />
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleSkipOptional}
                  className="flex-1"
                  disabled={loading}
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={() => handleSubmit(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-3">All Set! 🎉</h2>
              <p className="text-muted-foreground mb-8">
                Your company profile has been created successfully.<br />
                Redirecting to your dashboard...
              </p>
              <div className="animate-pulse">
                <div className="w-48 h-2 bg-primary/20 rounded-full mx-auto overflow-hidden">
                  <div className="w-full h-full bg-primary rounded-full animate-[slide_2s_ease-in-out]"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

