'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import ImageUpload from './ImageUpload';
import PortfolioGallery from './PortfolioGallery';
import { apiClient } from '@/lib/api/client';
import type { TalentProfile } from '@/lib/types';

export default function TalentProfileForm() {
  const [formData, setFormData] = useState({
    stageName: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    eyeColor: '',
    hairColor: '',
    city: '',
    experience: '',
    willingToTravel: false,
    skills: [] as string[],
    languages: [] as string[],
    instagramUrl: '',
    demoReelUrl: '',
  });

  const updateFormData = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Prefill form with existing profile data, if present
  useEffect(() => {
    let isMounted = true;
    async function loadExistingProfile() {
      try {
        const res = await apiClient.get<{ success: boolean; data: TalentProfile | null }>(
          '/api/v1/profiles/me'
        );
        const profile = res.data?.data;
        if (profile && isMounted) {
          setFormData({
            stageName: profile.stageName || '',
            dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
            gender: (profile.gender as string) || '',
            height: profile.height != null ? String(profile.height) : '',
            weight: profile.weight != null ? String(profile.weight) : '',
            eyeColor: profile.eyeColor || '',
            hairColor: profile.hairColor || '',
            city: profile.city || '',
            experience: profile.experience != null ? String(profile.experience) : '',
            willingToTravel: !!profile.willingToTravel,
            skills: profile.skills || [],
            languages: profile.languages || [],
            instagramUrl: profile.instagramUrl || '',
            demoReelUrl: profile.demoReelUrl || '',
          });
        }
      } catch (e) {
        console.error('Failed to load existing profile for edit:', e);
      }
    }
    loadExistingProfile();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      
      // Prepare data for API - convert numbers and ensure required fields
      const apiData = {
        stageName: formData.stageName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female' | 'other',
        city: formData.city,
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        eyeColor: formData.eyeColor || null,
        hairColor: formData.hairColor || null,
        experience: formData.experience ? parseInt(formData.experience) : null,
        willingToTravel: formData.willingToTravel,
        skills: formData.skills,
        languages: formData.languages,
        instagramUrl: formData.instagramUrl || null,
        demoReelUrl: formData.demoReelUrl || null,
      };
      
      const response = await fetch('/api/v1/profiles/talent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      });
      
      if (response.ok) {
        alert('Profile saved successfully!');
        // Redirect to dashboard or profile page
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Failed to create profile: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Error creating profile. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImageUpload={(url) => console.log('Image uploaded:', url)}
            currentImage=""
          />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Stage Name *
              </label>
              <Input
                value={formData.stageName}
                onChange={(e) => updateFormData('stageName', e.target.value)}
                placeholder="Your stage name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date of Birth *
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Gender *
              </label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                value={formData.gender}
                onChange={(e) => updateFormData('gender', e.target.value)}
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                City *
              </label>
              <Input
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
                placeholder="Riyadh"
                required
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Height (cm)
              </label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => updateFormData('height', e.target.value)}
                placeholder="170"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Weight (kg)
              </label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => updateFormData('weight', e.target.value)}
                placeholder="65"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Eye Color
              </label>
              <Input
                value={formData.eyeColor}
                onChange={(e) => updateFormData('eyeColor', e.target.value)}
                placeholder="Brown"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hair Color
              </label>
              <Input
                value={formData.hairColor}
                onChange={(e) => updateFormData('hairColor', e.target.value)}
                placeholder="Black"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills and Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Skills (comma-separated) *
            </label>
            <Input
              value={formData.skills?.join(', ') || ''}
              onChange={(e) => updateFormData('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              placeholder="Acting, Dancing, Singing, Voice Over"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Languages (comma-separated) *
            </label>
            <Input
              value={formData.languages?.join(', ') || ''}
              onChange={(e) => updateFormData('languages', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              placeholder="Arabic, English, French"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Years of Experience
            </label>
            <Input
              type="number"
              value={formData.experience}
              onChange={(e) => updateFormData('experience', e.target.value)}
              placeholder="5"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="willingToTravel"
              checked={formData.willingToTravel}
              onChange={(e) => updateFormData('willingToTravel', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="willingToTravel" className="text-sm font-medium text-foreground">
              Willing to travel for projects
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioGallery
            images={[]}
            onAddImage={(url) => console.log('Portfolio image added:', url)}
            onRemoveImage={(url) => console.log('Portfolio image removed:', url)}
          />
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Instagram URL
            </label>
            <Input
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => updateFormData('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Demo Reel URL
            </label>
            <Input
              type="url"
              value={formData.demoReelUrl}
              onChange={(e) => updateFormData('demoReelUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Save Profile
        </Button>
      </div>
    </form>
  );
}

