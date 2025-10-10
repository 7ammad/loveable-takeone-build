'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface DynamicFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multi-select';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface DynamicCasterFormProps {
  companyType: string;
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

// Field configurations for each company type
const TYPE_SPECIFIC_FIELDS: Record<string, DynamicFormField[]> = {
  // Production Companies
  film_production: [
    {
      name: 'productionFocus',
      label: 'Production Focus',
      type: 'multi-select',
      options: [
        { value: 'feature_films', label: 'Feature Films' },
        { value: 'short_films', label: 'Short Films' },
        { value: 'documentaries', label: 'Documentaries' },
      ],
    },
    {
      name: 'primaryShootingLocation',
      label: 'Primary Shooting Location',
      type: 'text',
      placeholder: 'e.g., Riyadh, Jeddah',
    },
  ],
  tv_production: [
    {
      name: 'productionFocus',
      label: 'Production Focus',
      type: 'multi-select',
      options: [
        { value: 'tv_series', label: 'TV Series' },
        { value: 'tv_shows', label: 'TV Shows' },
        { value: 'reality_tv', label: 'Reality TV' },
        { value: 'talk_shows', label: 'Talk Shows' },
      ],
    },
    {
      name: 'primaryShootingLocation',
      label: 'Primary Shooting Location',
      type: 'text',
      placeholder: 'e.g., Riyadh, Jeddah',
    },
  ],
  commercial_production: [
    {
      name: 'productionFocus',
      label: 'Production Focus',
      type: 'multi-select',
      options: [
        { value: 'tv_commercials', label: 'TV Commercials' },
        { value: 'online_ads', label: 'Online Ads' },
        { value: 'brand_videos', label: 'Brand Videos' },
        { value: 'social_media', label: 'Social Media Content' },
      ],
    },
    {
      name: 'primaryShootingLocation',
      label: 'Primary Shooting Location',
      type: 'text',
      placeholder: 'e.g., Riyadh, Jeddah',
    },
  ],
  documentary_production: [
    {
      name: 'productionFocus',
      label: 'Production Focus',
      type: 'multi-select',
      options: [
        { value: 'documentary_films', label: 'Documentary Films' },
        { value: 'documentary_series', label: 'Documentary Series' },
        { value: 'educational', label: 'Educational Content' },
      ],
    },
    {
      name: 'primaryShootingLocation',
      label: 'Primary Shooting Location',
      type: 'text',
      placeholder: 'e.g., Riyadh, Jeddah',
    },
  ],
  animation_studio: [
    {
      name: 'productionFocus',
      label: 'Production Focus',
      type: 'multi-select',
      options: [
        { value: 'animated_films', label: 'Animated Films' },
        { value: 'animated_series', label: 'Animated Series' },
        { value: 'digital_content', label: 'Digital Content' },
      ],
    },
  ],

  // Broadcasting & Media
  tv_channels: [
    {
      name: 'contentType',
      label: 'Content Type',
      type: 'multi-select',
      options: [
        { value: 'drama', label: 'Drama' },
        { value: 'comedy', label: 'Comedy' },
        { value: 'news', label: 'News' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'sports', label: 'Sports' },
        { value: 'documentary', label: 'Documentary' },
      ],
    },
    {
      name: 'audienceReach',
      label: 'Audience Reach',
      type: 'select',
      options: [
        { value: 'local', label: 'Local' },
        { value: 'regional', label: 'Regional' },
        { value: 'national', label: 'National' },
        { value: 'international', label: 'International' },
      ],
    },
  ],
  streaming_platforms: [
    {
      name: 'contentType',
      label: 'Content Type',
      type: 'multi-select',
      options: [
        { value: 'drama', label: 'Drama' },
        { value: 'comedy', label: 'Comedy' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'sports', label: 'Sports' },
        { value: 'documentary', label: 'Documentary' },
      ],
    },
    {
      name: 'audienceReach',
      label: 'Audience Reach',
      type: 'select',
      options: [
        { value: 'local', label: 'Local' },
        { value: 'regional', label: 'Regional' },
        { value: 'national', label: 'National' },
        { value: 'international', label: 'International' },
      ],
    },
  ],
  radio_stations: [
    {
      name: 'contentType',
      label: 'Content Type',
      type: 'multi-select',
      options: [
        { value: 'music', label: 'Music' },
        { value: 'news', label: 'News' },
        { value: 'talk_shows', label: 'Talk Shows' },
        { value: 'entertainment', label: 'Entertainment' },
      ],
    },
    {
      name: 'audienceReach',
      label: 'Audience Reach',
      type: 'select',
      options: [
        { value: 'local', label: 'Local' },
        { value: 'regional', label: 'Regional' },
        { value: 'national', label: 'National' },
      ],
    },
  ],

  // Advertising & Marketing
  advertising_agency: [
    {
      name: 'servicesOffered',
      label: 'Services Offered',
      type: 'multi-select',
      options: [
        { value: 'video_production', label: 'Video Production' },
        { value: 'social_media', label: 'Social Media Campaigns' },
        { value: 'brand_activation', label: 'Brand Activation' },
        { value: 'influencer_campaigns', label: 'Influencer Campaigns' },
        { value: 'photography', label: 'Photography' },
      ],
    },
    {
      name: 'industriesServed',
      label: 'Industries Served',
      type: 'multi-select',
      options: [
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'fashion', label: 'Fashion' },
        { value: 'technology', label: 'Technology' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'fnb', label: 'F&B' },
        { value: 'other', label: 'Other' },
      ],
    },
  ],
  digital_marketing: [
    {
      name: 'servicesOffered',
      label: 'Services Offered',
      type: 'multi-select',
      options: [
        { value: 'social_media', label: 'Social Media Marketing' },
        { value: 'content_creation', label: 'Content Creation' },
        { value: 'influencer_management', label: 'Influencer Management' },
        { value: 'video_production', label: 'Video Production' },
      ],
    },
    {
      name: 'industriesServed',
      label: 'Industries Served',
      type: 'multi-select',
      options: [
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'fashion', label: 'Fashion' },
        { value: 'technology', label: 'Technology' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'fnb', label: 'F&B' },
        { value: 'other', label: 'Other' },
      ],
    },
  ],
  influencer_management: [
    {
      name: 'servicesOffered',
      label: 'Services Offered',
      type: 'multi-select',
      options: [
        { value: 'talent_representation', label: 'Talent Representation' },
        { value: 'campaign_management', label: 'Campaign Management' },
        { value: 'content_strategy', label: 'Content Strategy' },
        { value: 'brand_partnerships', label: 'Brand Partnerships' },
      ],
    },
    {
      name: 'talentRosterSize',
      label: 'Talent Roster Size',
      type: 'select',
      options: [
        { value: '1-10', label: '1-10' },
        { value: '11-50', label: '11-50' },
        { value: '51-200', label: '51-200' },
        { value: '200+', label: '200+' },
      ],
    },
  ],

  // Events & Entertainment
  event_production: [
    {
      name: 'eventTypes',
      label: 'Event Types',
      type: 'multi-select',
      options: [
        { value: 'concerts', label: 'Concerts' },
        { value: 'festivals', label: 'Festivals' },
        { value: 'corporate_events', label: 'Corporate Events' },
        { value: 'weddings', label: 'Weddings' },
        { value: 'conferences', label: 'Conferences' },
      ],
    },
    {
      name: 'avgEventsPerYear',
      label: 'Average Events Per Year',
      type: 'number',
      placeholder: 'e.g., 50',
    },
  ],
  theater_company: [
    {
      name: 'eventTypes',
      label: 'Production Types',
      type: 'multi-select',
      options: [
        { value: 'theatrical_plays', label: 'Theatrical Plays' },
        { value: 'musicals', label: 'Musicals' },
        { value: 'comedy_shows', label: 'Comedy Shows' },
        { value: 'experimental_theater', label: 'Experimental Theater' },
      ],
    },
    {
      name: 'avgEventsPerYear',
      label: 'Average Productions Per Year',
      type: 'number',
      placeholder: 'e.g., 12',
    },
  ],
  festival_organizer: [
    {
      name: 'eventTypes',
      label: 'Festival Types',
      type: 'multi-select',
      options: [
        { value: 'cultural', label: 'Cultural Festivals' },
        { value: 'entertainment', label: 'Entertainment Festivals' },
        { value: 'food', label: 'Food Festivals' },
        { value: 'arts', label: 'Arts Festivals' },
      ],
    },
    {
      name: 'avgEventsPerYear',
      label: 'Average Festivals Per Year',
      type: 'number',
      placeholder: 'e.g., 5',
    },
  ],

  // Government & Institutions
  government_ministry: [
    {
      name: 'department',
      label: 'Department/Division',
      type: 'text',
      placeholder: 'e.g., Media & Communications Department',
    },
    {
      name: 'projectFrequency',
      label: 'Project Frequency',
      type: 'select',
      options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'annual', label: 'Annual' },
        { value: 'as_needed', label: 'As Needed' },
      ],
    },
  ],
  cultural_institution: [
    {
      name: 'department',
      label: 'Department/Division',
      type: 'text',
      placeholder: 'e.g., Programming & Events',
    },
    {
      name: 'projectFrequency',
      label: 'Project Frequency',
      type: 'select',
      options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'annual', label: 'Annual' },
        { value: 'as_needed', label: 'As Needed' },
      ],
    },
  ],
  educational_institution: [
    {
      name: 'department',
      label: 'Department/Division',
      type: 'text',
      placeholder: 'e.g., Media Studies Department',
    },
    {
      name: 'projectFrequency',
      label: 'Project Frequency',
      type: 'select',
      options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'annual', label: 'Annual' },
        { value: 'as_needed', label: 'As Needed' },
      ],
    },
  ],

  // Talent Agencies & Services
  casting_agency: [
    {
      name: 'talentRosterSize',
      label: 'Talent Roster Size',
      type: 'select',
      options: [
        { value: '1-10', label: '1-10' },
        { value: '11-50', label: '11-50' },
        { value: '51-200', label: '51-200' },
        { value: '200+', label: '200+' },
      ],
    },
    {
      name: 'specializations',
      label: 'Specializations',
      type: 'multi-select',
      options: [
        { value: 'actors', label: 'Actors' },
        { value: 'models', label: 'Models' },
        { value: 'voice_artists', label: 'Voice Artists' },
        { value: 'extras', label: 'Extras' },
        { value: 'child_actors', label: 'Child Actors' },
      ],
    },
  ],
  talent_management: [
    {
      name: 'talentRosterSize',
      label: 'Talent Roster Size',
      type: 'select',
      options: [
        { value: '1-10', label: '1-10' },
        { value: '11-50', label: '11-50' },
        { value: '51-200', label: '51-200' },
        { value: '200+', label: '200+' },
      ],
    },
    {
      name: 'specializations',
      label: 'Specializations',
      type: 'multi-select',
      options: [
        { value: 'actors', label: 'Actors' },
        { value: 'models', label: 'Models' },
        { value: 'influencers', label: 'Influencers' },
        { value: 'presenters', label: 'Presenters' },
      ],
    },
  ],
  voice_dubbing: [
    {
      name: 'servicesOffered',
      label: 'Services Offered',
      type: 'multi-select',
      options: [
        { value: 'voice_over', label: 'Voice Over' },
        { value: 'dubbing', label: 'Dubbing' },
        { value: 'audio_production', label: 'Audio Production' },
        { value: 'sound_design', label: 'Sound Design' },
      ],
    },
    {
      name: 'talentRosterSize',
      label: 'Voice Artist Roster Size',
      type: 'select',
      options: [
        { value: '1-10', label: '1-10' },
        { value: '11-50', label: '11-50' },
        { value: '51-200', label: '51-200' },
        { value: '200+', label: '200+' },
      ],
    },
  ],
  model_agency: [
    {
      name: 'talentRosterSize',
      label: 'Model Roster Size',
      type: 'select',
      options: [
        { value: '1-10', label: '1-10' },
        { value: '11-50', label: '11-50' },
        { value: '51-200', label: '51-200' },
        { value: '200+', label: '200+' },
      ],
    },
    {
      name: 'specializations',
      label: 'Specializations',
      type: 'multi-select',
      options: [
        { value: 'fashion', label: 'Fashion Models' },
        { value: 'commercial', label: 'Commercial Models' },
        { value: 'runway', label: 'Runway Models' },
        { value: 'influencers', label: 'Influencers' },
      ],
    },
  ],

  // Corporate & Freelance
  corporate_brand: [
    {
      name: 'industry',
      label: 'Industry',
      type: 'select',
      options: [
        { value: 'technology', label: 'Technology' },
        { value: 'finance', label: 'Finance' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'retail', label: 'Retail' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'other', label: 'Other' },
      ],
    },
  ],
  independent_producer: [
    {
      name: 'previousProjects',
      label: 'Previous Projects Completed',
      type: 'number',
      placeholder: 'e.g., 15',
    },
    {
      name: 'specializations',
      label: 'Specializations',
      type: 'multi-select',
      options: [
        { value: 'film', label: 'Film' },
        { value: 'tv', label: 'TV' },
        { value: 'commercials', label: 'Commercials' },
        { value: 'documentaries', label: 'Documentaries' },
      ],
    },
  ],
};

export default function DynamicCasterForm({ companyType, formData, onChange }: DynamicCasterFormProps) {
  const fields = TYPE_SPECIFIC_FIELDS[companyType] || [];

  if (fields.length === 0) {
    return null;
  }

  const handleMultiSelectAdd = (fieldName: string, value: string) => {
    const currentValues = formData[fieldName] || [];
    if (!currentValues.includes(value)) {
      onChange(fieldName, [...currentValues, value]);
    }
  };

  const handleMultiSelectRemove = (fieldName: string, value: string) => {
    const currentValues = formData[fieldName] || [];
    onChange(fieldName, currentValues.filter((v: string) => v !== value));
  };

  return (
    <div className="space-y-6 pt-6 mt-6 border-t">
      <div>
        <h3 className="text-lg font-semibold mb-1">Company Specific Details</h3>
        <p className="text-sm text-muted-foreground">
          Tell us more about your specific business needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.name} className={field.type === 'multi-select' ? 'md:col-span-2' : ''}>
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.type === 'text' && (
              <Input
                id={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-2"
              />
            )}

            {field.type === 'number' && (
              <Input
                id={field.name}
                type="number"
                value={formData[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-2"
              />
            )}

            {field.type === 'select' && (
              <select
                id={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              >
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'multi-select' && (
              <div className="mt-2 space-y-3">
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleMultiSelectAdd(field.name, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.options?.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={(formData[field.name] || []).includes(option.value)}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                {formData[field.name] && formData[field.name].length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData[field.name].map((value: string) => {
                      const option = field.options?.find((o) => o.value === value);
                      return (
                        <Badge key={value} variant="secondary" className="pr-1">
                          {option?.label || value}
                          <button
                            type="button"
                            onClick={() => handleMultiSelectRemove(field.name, value)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

