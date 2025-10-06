'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/auth-context';

interface CasterProfile {
  id: string;
  userId: string;
  companyName: string;
  companyType: string;
  commercialRegistration: string;
  businessPhone: string;
  businessEmail: string;
  website: string;
  city: string;
  yearsInBusiness: number;
  teamSize: number;
  specializations: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

const COMPANY_TYPES = [
  { value: 'production_company', label: 'Production Company' },
  { value: 'advertising_agency', label: 'Advertising Agency' },
  { value: 'independent', label: 'Independent' },
];

const SPECIALIZATION_OPTIONS = [
  'Film Production',
  'TV Series',
  'Commercials',
  'Documentary',
  'Animation',
  'Theater',
  'Voice Acting',
  'Music Videos',
  'Corporate Videos',
  'Event Production',
  'Digital Content',
  'Brand Marketing',
];

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CasterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyType: '',
    commercialRegistration: '',
    businessPhone: '',
    businessEmail: '',
    website: '',
    city: '',
    yearsInBusiness: '',
    teamSize: '',
    specializations: [] as string[],
  });

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await apiClient.get<{ success: boolean; data: CasterProfile | null }>('/api/v1/profiles/me');
        
        if (response.data.success && response.data.data) {
          const profileData = response.data.data;
          setProfile(profileData);
          setFormData({
            companyName: profileData.companyName || '',
            companyType: profileData.companyType || '',
            commercialRegistration: profileData.commercialRegistration || '',
            businessPhone: profileData.businessPhone || '',
            businessEmail: profileData.businessEmail || '',
            website: profileData.website || '',
            city: profileData.city || '',
            yearsInBusiness: profileData.yearsInBusiness?.toString() || '',
            teamSize: profileData.teamSize?.toString() || '',
            specializations: profileData.specializations || [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'caster') {
      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (profile) {
        // Update existing profile
        const response = await apiClient.patch<{ success: boolean; data: CasterProfile }>('/api/v1/profiles/caster', {
          companyName: formData.companyName,
          companyType: formData.companyType,
          commercialRegistration: formData.commercialRegistration,
          businessPhone: formData.businessPhone,
          businessEmail: formData.businessEmail,
          website: formData.website,
          city: formData.city,
          yearsInBusiness: parseInt(formData.yearsInBusiness) || 0,
          teamSize: parseInt(formData.teamSize) || 0,
          specializations: formData.specializations,
        });
        
        if (response.data.success) {
          setProfile(response.data.data);
          setEditing(false);
        }
      } else {
        // Create new profile
        const response = await apiClient.post<{ success: boolean; data: CasterProfile }>('/api/v1/profiles/caster', {
          companyName: formData.companyName,
          companyType: formData.companyType,
          commercialRegistration: formData.commercialRegistration,
          businessPhone: formData.businessPhone,
          businessEmail: formData.businessEmail,
          website: formData.website,
          city: formData.city,
          yearsInBusiness: parseInt(formData.yearsInBusiness) || 0,
          teamSize: parseInt(formData.teamSize) || 0,
          specializations: formData.specializations,
        });
        
        if (response.data.success) {
          setProfile(response.data.data);
          setEditing(false);
        }
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.companyName,
      profile.companyType,
      profile.businessPhone,
      profile.businessEmail,
      profile.city,
      profile.specializations.length > 0,
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="caster">
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
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
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Company Profile</h1>
                <p className="text-muted-foreground">
                  Manage your company information and verification status
                </p>
              </div>
              <div className="flex items-center gap-4">
                {profile && (
                  <Badge className={`${profile.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {profile.verified ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Pending Verification
                      </>
                    )}
                  </Badge>
                )}
                {!editing ? (
                  <Button onClick={() => setEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Profile Completion */}
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Profile Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Profile Completeness</span>
                      <span className="text-sm text-muted-foreground">{getCompletionPercentage()}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${getCompletionPercentage()}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Complete your profile to improve your visibility and credibility to talent.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyType">Company Type *</Label>
                    <select
                      id="companyType"
                      value={formData.companyType}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyType: e.target.value }))}
                      disabled={!editing}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="">Select company type</option>
                      {COMPANY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!editing}
                      placeholder="e.g. Riyadh, Jeddah"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsInBusiness">Years in Business</Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      value={formData.yearsInBusiness}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearsInBusiness: e.target.value }))}
                      disabled={!editing}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    value={formData.teamSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                    disabled={!editing}
                    placeholder="Number of employees"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email *</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
                      disabled={!editing}
                      placeholder="contact@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business Phone *</Label>
                    <Input
                      id="businessPhone"
                      value={formData.businessPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessPhone: e.target.value }))}
                      disabled={!editing}
                      placeholder="+966 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    disabled={!editing}
                    placeholder="https://www.company.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select the types of projects you specialize in:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SPECIALIZATION_OPTIONS.map(specialization => (
                      <button
                        key={specialization}
                        onClick={() => editing && handleSpecializationToggle(specialization)}
                        disabled={!editing}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          formData.specializations.includes(specialization)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        } ${!editing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        {specialization}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commercial Registration */}
            <Card>
              <CardHeader>
                <CardTitle>Business Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="commercialRegistration">Commercial Registration Number</Label>
                  <Input
                    id="commercialRegistration"
                    value={formData.commercialRegistration}
                    onChange={(e) => setFormData(prev => ({ ...prev, commercialRegistration: e.target.value }))}
                    disabled={!editing}
                    placeholder="Enter your commercial registration number"
                  />
                  <p className="text-xs text-muted-foreground">
                    Providing your commercial registration helps with verification and builds trust with talent.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
