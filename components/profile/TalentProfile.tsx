'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Star,
  Edit,
  Save,
  Upload,
  Camera
} from 'lucide-react';

export default function TalentProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Mock profile data - replace with real API call
  const [profileData, setProfileData] = useState({
    stageName: 'Sarah Al-Ahmed',
    dateOfBirth: '1995-03-15',
    gender: 'female',
    height: 165,
    eyeColor: 'Brown',
    hairColor: 'Black',
    city: 'Riyadh',
    phone: '+966 50 123 4567',
    skills: ['Acting', 'Voice Acting', 'Dancing', 'Singing'],
    languages: ['Arabic', 'English', 'French'],
    experience: 5,
    bio: 'Passionate actress with 5 years of experience in theater and television. Specialized in dramatic roles and voice acting.',
    education: 'BA in Theater Arts',
    willingToTravel: true,
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
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
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
            {/* Profile Picture */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                      {profileData.stageName.charAt(0)}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                        <Camera className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mt-4">
                    {profileData.stageName}
                  </h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  
                  {/* Profile Completion */}
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Profile Completion</span>
                      <span className="text-sm font-bold text-primary">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Add portfolio items to reach 100%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Experience</span>
                  <span className="text-sm font-semibold">{profileData.experience} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Applications</span>
                  <span className="text-sm font-semibold">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profile Views</span>
                  <span className="text-sm font-semibold">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="text-sm font-semibold">4.8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Stage Name
                    </label>
                    <Input 
                      value={profileData.stageName}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, stageName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <Input value={user?.email || ''} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <Input 
                      value={profileData.phone}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
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
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date of Birth
                    </label>
                    <Input 
                      type="date"
                      value={profileData.dateOfBirth}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Gender
                    </label>
                    <Input 
                      value={profileData.gender}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Attributes */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Height (cm)
                    </label>
                    <Input 
                      type="number"
                      value={profileData.height}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, height: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Eye Color
                    </label>
                    <Input 
                      value={profileData.eyeColor}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, eyeColor: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hair Color
                    </label>
                    <Input 
                      value={profileData.hairColor}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, hairColor: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {isEditing && (
                      <Button size="sm" variant="outline">+ Add Skill</Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.languages.map((language, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-sm font-medium"
                      >
                        {language}
                      </span>
                    ))}
                    {isEditing && (
                      <Button size="sm" variant="outline">+ Add Language</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-foreground resize-none"
                  value={profileData.bio}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                />
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Portfolio</CardTitle>
                  {isEditing && (
                    <Button size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Media
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                  ))}
                  {isEditing && (
                    <button className="aspect-video border-2 border-dashed border-muted rounded-lg flex items-center justify-center hover:border-primary transition-colors">
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Add Media</p>
                      </div>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

