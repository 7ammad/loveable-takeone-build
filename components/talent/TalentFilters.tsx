'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface TalentFilterOptions {
  location?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  experienceMin?: number;
  skills?: string[];
  languages?: string[];
  verified?: boolean;
}

interface TalentFiltersProps {
  filters: TalentFilterOptions;
  onFilterChange: (filters: TalentFilterOptions) => void;
  onClearFilters: () => void;
}

export default function TalentFilters({ filters, onFilterChange, onClearFilters }: TalentFiltersProps) {
  const updateFilter = (key: keyof TalentFilterOptions, value: string | number | string[] | boolean | undefined) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="h-8 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Location
          </label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="Riyadh">Riyadh</option>
            <option value="Jeddah">Jeddah</option>
            <option value="Dammam">Dammam</option>
            <option value="Mecca">Mecca</option>
            <option value="Medina">Medina</option>
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Gender
          </label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
            value={filters.gender || ''}
            onChange={(e) => updateFilter('gender', e.target.value)}
          >
            <option value="">Any Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Age Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.ageMin || ''}
              onChange={(e) => updateFilter('ageMin', parseInt(e.target.value) || undefined)}
              min="18"
              max="100"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.ageMax || ''}
              onChange={(e) => updateFilter('ageMax', parseInt(e.target.value) || undefined)}
              min="18"
              max="100"
            />
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Minimum Experience (Years)
          </label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
            value={filters.experienceMin || ''}
            onChange={(e) => updateFilter('experienceMin', parseInt(e.target.value) || undefined)}
          >
            <option value="">Any Experience</option>
            <option value="0">No Experience Required</option>
            <option value="1">1+ Years</option>
            <option value="3">3+ Years</option>
            <option value="5">5+ Years</option>
            <option value="10">10+ Years</option>
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Skills
          </label>
          <div className="space-y-2">
            {['Acting', 'Voice Acting', 'Dancing', 'Singing', 'Modeling'].map((skill) => (
              <label key={skill} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.skills?.includes(skill) || false}
                  onChange={(e) => {
                    const currentSkills = filters.skills || [];
                    const newSkills = e.target.checked
                      ? [...currentSkills, skill]
                      : currentSkills.filter(s => s !== skill);
                    updateFilter('skills', newSkills.length > 0 ? newSkills : undefined);
                  }}
                  className="w-4 h-4"
                />
                <span className="text-foreground">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Languages
          </label>
          <div className="space-y-2">
            {['Arabic', 'English', 'French', 'Spanish'].map((language) => (
              <label key={language} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.languages?.includes(language) || false}
                  onChange={(e) => {
                    const currentLanguages = filters.languages || [];
                    const newLanguages = e.target.checked
                      ? [...currentLanguages, language]
                      : currentLanguages.filter(l => l !== language);
                    updateFilter('languages', newLanguages.length > 0 ? newLanguages : undefined);
                  }}
                  className="w-4 h-4"
                />
                <span className="text-foreground">{language}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Verified Only */}
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.verified || false}
              onChange={(e) => updateFilter('verified', e.target.checked || undefined)}
              className="w-4 h-4"
            />
            <span className="text-foreground font-medium">Verified Profiles Only</span>
          </label>
        </div>

        {/* Apply Filters Button */}
        <Button className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}

