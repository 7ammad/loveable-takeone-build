'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, User, MapPin, Star, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface TalentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
  TalentProfile: {
    stageName: string | null;
    age: number | null;
    gender: string | null;
    height: number | null;
    weight: number | null;
    eyeColor: string | null;
    hairColor: string | null;
    skills: string[];
    languages: string[];
    experience: number | null;
    city: string | null;
    willingToTravel: boolean;
    portfolioUrl: string | null;
    demoReelUrl: string | null;
    instagramUrl: string | null;
    verified: boolean;
    rating: number | null;
    completionPercentage: number;
  } | null;
}

interface SearchFilters {
  query: string;
  ageRange: [number, number];
  experience: string;
  languages: string[];
  skills: string[];
  location: string;
  gender: string;
  willingToTravel: boolean;
  verified: boolean;
  sortBy: string;
  sortOrder: string;
}

const initialFilters: SearchFilters = {
  query: '',
  ageRange: [18, 65],
  experience: '',
  languages: [],
  skills: [],
  location: '',
  gender: '',
  willingToTravel: false,
  verified: false,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const experienceOptions = [
  { value: '0-1', label: '0-1 years' },
  { value: '2-5', label: '2-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '10+', label: '10+ years' },
];

const languageOptions = [
  'Arabic', 'English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean'
];

const skillOptions = [
  'Acting', 'Dancing', 'Singing', 'Comedy', 'Drama', 'Action', 'Stunt Work', 'Voice Acting', 'Modeling', 'Hosting', 'Improvisation'
];

export function AdvancedTalentSearch() {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [talent, setTalent] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    performSearch();
  }, [currentPage]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.query) params.append('query', filters.query);
      if (filters.ageRange[0] !== 18) params.append('ageMin', filters.ageRange[0].toString());
      if (filters.ageRange[1] !== 65) params.append('ageMax', filters.ageRange[1].toString());
      if (filters.experience) params.append('experience', filters.experience);
      if (filters.languages.length > 0) params.append('languages', filters.languages.join(','));
      if (filters.skills.length > 0) params.append('skills', filters.skills.join(','));
      if (filters.location) params.append('location', filters.location);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.willingToTravel) params.append('willingToTravel', 'true');
      if (filters.verified) params.append('verified', 'true');
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const response = await apiClient.get<{ success: boolean; data: { talent: any[]; pagination: { total: number } } }>(`/api/v1/talent/search?${params.toString()}`);
      const data = response.data.data;
      
      setTalent(data.talent);
      setTotalResults(data.pagination.total);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    performSearch();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterChange = (key: 'languages' | 'skills', value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...prev[key], value]
        : prev[key].filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 65) count++;
    if (filters.experience) count++;
    if (filters.languages.length > 0) count++;
    if (filters.skills.length > 0) count++;
    if (filters.location) count++;
    if (filters.gender) count++;
    if (filters.willingToTravel) count++;
    if (filters.verified) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, stage name, or bio..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Age Range */}
            <div className="space-y-2">
              <Label>Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years</Label>
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => handleFilterChange('ageRange', value)}
                max={80}
                min={16}
                step={1}
                className="w-full"
              />
            </div>

            {/* Experience and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience</Label>
                <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any experience</SelectItem>
                    {experienceOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any gender</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Enter city or region..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {languageOptions.map(lang => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${lang}`}
                      checked={filters.languages.includes(lang)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('languages', lang, checked as boolean)
                      }
                    />
                    <Label htmlFor={`lang-${lang}`} className="text-sm">{lang}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {skillOptions.map(skill => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={filters.skills.includes(skill)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('skills', skill, checked as boolean)
                      }
                    />
                    <Label htmlFor={`skill-${skill}`} className="text-sm">{skill}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="willingToTravel"
                  checked={filters.willingToTravel}
                  onCheckedChange={(checked) => handleFilterChange('willingToTravel', checked)}
                />
                <Label htmlFor="willingToTravel">Willing to travel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.verified}
                  onCheckedChange={(checked) => handleFilterChange('verified', checked)}
                />
                <Label htmlFor="verified">Verified profiles only</Label>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort by</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date joined</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest first</SelectItem>
                    <SelectItem value="asc">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {loading ? 'Searching...' : `${totalResults} talent found`}
          </h3>
          {getActiveFiltersCount() > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <div className="flex gap-1">
                {filters.query && <Badge variant="secondary">{filters.query}</Badge>}
                {filters.experience && <Badge variant="secondary">{experienceOptions.find(opt => opt.value === filters.experience)?.label}</Badge>}
                {filters.gender && <Badge variant="secondary">{filters.gender}</Badge>}
                {filters.languages.map(lang => <Badge key={lang} variant="secondary">{lang}</Badge>)}
                {filters.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
              </div>
            </div>
          )}
        </div>

        {talent.length === 0 && !loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No talent found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talent.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.TalentProfile?.stageName || user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.name}</p>
                        {user.TalentProfile?.verified && (
                          <Badge variant="secondary" className="text-xs mt-1">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {user.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {user.bio}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {user.TalentProfile?.age && (
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {user.TalentProfile.age} years old
                      </div>
                    )}
                    {user.TalentProfile?.city && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {user.TalentProfile.city}
                      </div>
                    )}
                    {user.TalentProfile?.experience && (
                      <div className="flex items-center text-muted-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        {user.TalentProfile.experience} years experience
                      </div>
                    )}
                  </div>
                  
                  {user.TalentProfile?.skills && user.TalentProfile.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {user.TalentProfile.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {user.TalentProfile.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.TalentProfile.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
