'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin,
  Star,
  Eye,
  MessageCircle,
  Filter,
  Users,
  Calendar
} from 'lucide-react';

interface TalentProfile {
  id: string;
  userId: string;
  stageName?: string;
  city?: string;
  skills: string[];
  languages: string[];
  experience?: number;
  rating?: number;
  completionPercentage: number;
  user: {
    name: string;
    avatar?: string;
  };
}

export default function TalentSearchPage() {
  const [talent, setTalent] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Mock data for now - will be replaced with real API call
  useEffect(() => {
    async function fetchTalent() {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock talent data
        const mockTalent: TalentProfile[] = [
          {
            id: '1',
            userId: 'user1',
            stageName: 'Sarah Al-Ahmed',
            city: 'Riyadh',
            skills: ['Acting', 'Voice Acting', 'Dancing'],
            languages: ['Arabic', 'English'],
            experience: 5,
            rating: 4.8,
            completionPercentage: 95,
            user: {
              name: 'Sarah Al-Ahmed',
              avatar: undefined,
            }
          },
          {
            id: '2',
            userId: 'user2',
            stageName: 'Mohammed Al-Rashid',
            city: 'Jeddah',
            skills: ['Acting', 'Comedy', 'Improv'],
            languages: ['Arabic', 'English', 'French'],
            experience: 8,
            rating: 4.9,
            completionPercentage: 88,
            user: {
              name: 'Mohammed Al-Rashid',
              avatar: undefined,
            }
          },
          {
            id: '3',
            userId: 'user3',
            stageName: 'Fatima Al-Otaibi',
            city: 'Riyadh',
            skills: ['Voice Acting', 'Singing', 'Narrating'],
            languages: ['Arabic', 'English'],
            experience: 3,
            rating: 4.6,
            completionPercentage: 92,
            user: {
              name: 'Fatima Al-Otaibi',
              avatar: undefined,
            }
          },
        ];
        
        setTalent(mockTalent);
      } catch (error) {
        console.error('Failed to fetch talent:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTalent();
  }, []);

  const filteredTalent = talent.filter(profile => {
    const matchesSearch = profile.stageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         profile.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         profile.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => profile.skills.includes(skill));
    const matchesLocation = !selectedLocation || profile.city === selectedLocation;
    
    return matchesSearch && matchesSkills && matchesLocation;
  });

  const availableSkills = Array.from(new Set(talent.flatMap(t => t.skills)));
  const availableLocations = Array.from(new Set(talent.map(t => t.city).filter((city): city is string => Boolean(city))));

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <ProtectedRoute requiredRole="caster">
      <div className="min-h-screen bg-background">
        <DashboardNav />
        
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Search Talent</h1>
            <p className="text-muted-foreground">
              Discover and connect with talented individuals for your projects
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Location Filter */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Location</h4>
                    <div className="space-y-2">
                      <Button
                        variant={selectedLocation === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLocation('')}
                        className="w-full justify-start"
                      >
                        All Locations
                      </Button>
                      {availableLocations.map(location => (
                        <Button
                          key={location}
                          variant={selectedLocation === location ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedLocation(location)}
                          className="w-full justify-start"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          {location}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Skills Filter */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Skills</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableSkills.map(skill => (
                        <Button
                          key={skill}
                          variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSkillToggle(skill)}
                          className="w-full justify-start"
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search by name, location, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredTalent.length}</span> talent profiles
                </p>
              </div>

              {/* Talent Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
                          <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                          <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-4"></div>
                          <div className="h-10 bg-muted rounded w-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredTalent.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="p-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No talent found</h3>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your search criteria or filters
                      </p>
                    </Card>
                  </div>
                ) : (
                  filteredTalent.map((profile) => (
                    <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        
                        {/* Profile Header */}
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl font-bold text-primary">
                              {profile.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-foreground mb-1">
                            {profile.stageName || profile.user.name}
                          </h3>
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{profile.city}</span>
                          </div>
                        </div>

                        {/* Rating & Experience */}
                        <div className="flex items-center justify-center gap-4 mb-4">
                          {profile.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{profile.rating}</span>
                            </div>
                          )}
                          {profile.experience && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-sm text-muted-foreground">
                                {profile.experience} years
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {profile.skills.slice(0, 3).map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {profile.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Profile Completion */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Profile Complete</span>
                            <span className="font-medium">{profile.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all"
                              style={{ width: `${profile.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                          <Button size="sm" className="flex-1">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}