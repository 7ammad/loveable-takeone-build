'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import ImageUpload from './ImageUpload';
import PortfolioGallery from './PortfolioGallery';

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
    bio: '',
    instagramUrl: '',
    demoReelUrl: '',
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log('Submitting:', formData);
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bio
            </label>
            <textarea
              className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-foreground resize-y"
              value={formData.bio}
              onChange={(e) => updateFormData('bio', e.target.value)}
              placeholder="Tell us about yourself..."
            />
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

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Years of Experience *
            </label>
            <Input
              type="number"
              value={formData.experience}
              onChange={(e) => updateFormData('experience', e.target.value)}
              placeholder="5"
              required
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

