'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface FilterOptions {
  location?: string;
  compensation?: string;
  projectType?: string;
  deadline?: string;
  status?: string;
}

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

export default function FilterSidebar({ filters, onFilterChange, onClearFilters }: FilterSidebarProps) {
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

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
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Project Type
          </label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
            value={filters.projectType || ''}
            onChange={(e) => updateFilter('projectType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="tv_series">TV Series</option>
            <option value="film">Film</option>
            <option value="commercial">Commercial</option>
            <option value="theater">Theater</option>
            <option value="voice_acting">Voice Acting</option>
          </select>
        </div>

        {/* Compensation Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Compensation Range
          </label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
            value={filters.compensation || ''}
            onChange={(e) => updateFilter('compensation', e.target.value)}
          >
            <option value="">Any Range</option>
            <option value="0-20000">SAR 0 - 20,000</option>
            <option value="20000-50000">SAR 20,000 - 50,000</option>
            <option value="50000-100000">SAR 50,000 - 100,000</option>
            <option value="100000+">SAR 100,000+</option>
          </select>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Application Deadline
          </label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
            value={filters.deadline || ''}
            onChange={(e) => updateFilter('deadline', e.target.value)}
          >
            <option value="">Any Time</option>
            <option value="3">Next 3 Days</option>
            <option value="7">Next 7 Days</option>
            <option value="14">Next 14 Days</option>
            <option value="30">Next 30 Days</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Status
          </label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="published">Open</option>
            <option value="closing_soon">Closing Soon</option>
            <option value="verified">Verified Only</option>
          </select>
        </div>

        {/* Apply Filters Button */}
        <Button className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}

