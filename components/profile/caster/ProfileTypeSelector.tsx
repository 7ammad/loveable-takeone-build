'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap, Star } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ProfileTypeSelectorProps {
  currentType: 'basic' | 'advanced';
  onTypeChange: (type: 'basic' | 'advanced') => void;
}

export default function ProfileTypeSelector({ currentType, onTypeChange }: ProfileTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<'basic' | 'advanced'>(currentType);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (selectedType === currentType) return;
    
    setSaving(true);
    try {
      await apiClient.patch('/api/v1/caster-profiles/me', {
        profileType: selectedType,
      });
      onTypeChange(selectedType);
    } catch (error) {
      console.error('Failed to update profile type:', error);
      setSelectedType(currentType); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Type</CardTitle>
        <p className="text-sm text-muted-foreground">Choose the profile style that works best for you</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Profile Option */}
          <button
            onClick={() => setSelectedType('basic')}
            className={`p-6 border-2 rounded-lg text-left transition-all ${
              selectedType === 'basic'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Basic Profile</h3>
              </div>
              {selectedType === 'basic' && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Quick setup, essential features only
            </p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Company info & description</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Active casting calls widget</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Contact information</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Verification badge</span>
              </li>
            </ul>

            <div className="mt-4 text-xs text-muted-foreground">
              ⏱️ Setup time: ~5 minutes
            </div>
          </button>

          {/* Advanced Profile Option */}
          <button
            onClick={() => setSelectedType('advanced')}
            className={`p-6 border-2 rounded-lg text-left transition-all ${
              selectedType === 'advanced'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-lg">Advanced Profile</h3>
              </div>
              {selectedType === 'advanced' && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Full-featured, comprehensive showcase
            </p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Everything in Basic</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Showreel & portfolio gallery</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Team directory & awards</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Testimonials & past projects</span>
              </li>
            </ul>

            <div className="mt-4 text-xs text-muted-foreground">
              ⏱️ Setup time: ~30 minutes
            </div>
          </button>
        </div>

        {selectedType !== currentType && (
          <div className="mt-6 flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Switch to {selectedType === 'basic' ? 'Basic' : 'Advanced'} Profile?</strong>
              <br />
              <span className="text-blue-700">
                {selectedType === 'basic' 
                  ? 'Some sections will be hidden but your data will be saved.'
                  : 'You can add more details to showcase your work.'}
              </span>
            </p>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

