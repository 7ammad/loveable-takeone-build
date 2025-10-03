'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import ImageUpload from './ImageUpload';

export default function HirerProfileForm() {
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
    description: '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log('Submitting:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImageUpload={(url) => console.log('Logo uploaded:', url)}
            currentImage=""
          />
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company Name *
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => updateFormData('companyName', e.target.value)}
              placeholder="Your Company Name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Type *
              </label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                value={formData.companyType}
                onChange={(e) => updateFormData('companyType', e.target.value)}
                required
              >
                <option value="">Select type</option>
                <option value="production_company">Production Company</option>
                <option value="advertising_agency">Advertising Agency</option>
                <option value="independent">Independent</option>
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
              Company Description
            </label>
            <textarea
              className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-foreground resize-y"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe your company and what you do..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Commercial Registration Number *
            </label>
            <Input
              value={formData.commercialRegistration}
              onChange={(e) => updateFormData('commercialRegistration', e.target.value)}
              placeholder="1234567890"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Years in Business *
              </label>
              <Input
                type="number"
                value={formData.yearsInBusiness}
                onChange={(e) => updateFormData('yearsInBusiness', e.target.value)}
                placeholder="5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Team Size
              </label>
              <Input
                type="number"
                value={formData.teamSize}
                onChange={(e) => updateFormData('teamSize', e.target.value)}
                placeholder="10"
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
                Business Email *
              </label>
              <Input
                type="email"
                value={formData.businessEmail}
                onChange={(e) => updateFormData('businessEmail', e.target.value)}
                placeholder="contact@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Business Phone *
              </label>
              <Input
                type="tel"
                value={formData.businessPhone}
                onChange={(e) => updateFormData('businessPhone', e.target.value)}
                placeholder="+966 5X XXX XXXX"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Website
            </label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => updateFormData('website', e.target.value)}
              placeholder="https://www.company.com"
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

