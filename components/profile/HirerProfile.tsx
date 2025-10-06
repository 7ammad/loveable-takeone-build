'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2,
  Edit,
  Save,
  Camera,
  CheckCircle2
} from 'lucide-react';

export default function HirerProfile() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Mock profile data - replace with real API call
  const [profileData, setProfileData] = useState({
    companyName: 'MBC Studios',
    companyType: 'Production Company',
    commercialRegistration: '1234567890',
    businessPhone: '+966 11 234 5678',
    businessEmail: 'contact@mbcstudios.com',
    website: 'https://www.mbcstudios.com',
    city: 'Riyadh',
    yearsInBusiness: 15,
    teamSize: 50,
    specializations: ['Drama', 'Comedy', 'Documentary', 'Commercial'],
    description: 'Leading production company in Saudi Arabia, specializing in high-quality television content and commercial productions.',
    verified: true,
  });

  const handleSave = () => {
    // TODO: Save to API
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Company Profile</h1>
            <Button onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Company Logo */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center text-white text-4xl font-bold mx-auto">
                      {profileData.companyName.charAt(0)}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                        <Camera className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mt-4 flex items-center justify-center gap-2">
                    {profileData.companyName}
                    {profileData.verified && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </h2>
                  <p className="text-muted-foreground">{profileData.companyType}</p>
                  
                  {/* Verification Badge */}
                  {profileData.verified && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified Company</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Years in Business</span>
                  <span className="text-sm font-semibold">{profileData.yearsInBusiness}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Team Size</span>
                  <span className="text-sm font-semibold">{profileData.teamSize}+ employees</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Casting Calls</span>
                  <span className="text-sm font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Hires</span>
                  <span className="text-sm font-semibold">127</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company Name
                    </label>
                    <Input 
                      value={profileData.companyName}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company Type
                    </label>
                    <Input 
                      value={profileData.companyType}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, companyType: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Commercial Registration
                    </label>
                    <Input 
                      value={profileData.commercialRegistration}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, commercialRegistration: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City
                    </label>
                    <Input 
                      value={profileData.city}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Business Email
                    </label>
                    <Input 
                      type="email"
                      value={profileData.businessEmail}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, businessEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Business Phone
                    </label>
                    <Input 
                      type="tel"
                      value={profileData.businessPhone}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, businessPhone: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Website
                    </label>
                    <Input 
                      type="url"
                      value={profileData.website}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Years in Business
                    </label>
                    <Input 
                      type="number"
                      value={profileData.yearsInBusiness}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, yearsInBusiness: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Team Size
                    </label>
                    <Input 
                      type="number"
                      value={profileData.teamSize}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, teamSize: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileData.specializations.map((spec, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                  {isEditing && (
                    <Button size="sm" variant="outline">+ Add Specialization</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Description */}
            <Card>
              <CardHeader>
                <CardTitle>Company Description</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-foreground resize-none"
                  value={profileData.description}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                  placeholder="Tell us about your company..."
                />
              </CardContent>
            </Card>

            {/* Past Productions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Past Productions</CardTitle>
                  {isEditing && (
                    <Button size="sm">+ Add Production</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Drama Series Title</h4>
                        <p className="text-sm text-muted-foreground mt-1">2023 • 20 Episodes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

