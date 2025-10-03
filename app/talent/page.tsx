'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Filter,
  MapPin,
  Star,
  CheckCircle2,
  Award,
  Mail,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function TalentSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - replace with real API call
  const talents = [
    {
      id: 1,
      name: 'Sarah Al-Ahmed',
      stageName: 'Sarah A.',
      location: 'Riyadh',
      age: 28,
      gender: 'Female',
      rating: 4.8,
      experience: 5,
      skills: ['Acting', 'Voice Acting', 'Dancing'],
      languages: ['Arabic', 'English', 'French'],
      verified: true,
      profileViews: 234,
      activeApplications: 3,
      bio: 'Passionate actress with 5 years of experience in theater and television.',
    },
    {
      id: 2,
      name: 'Mohammed Al-Rashid',
      stageName: 'Mo Rashid',
      location: 'Jeddah',
      age: 35,
      gender: 'Male',
      rating: 4.9,
      experience: 10,
      skills: ['Acting', 'Stunt Work', 'Horseback Riding'],
      languages: ['Arabic', 'English'],
      verified: true,
      profileViews: 456,
      activeApplications: 2,
      bio: 'Veteran actor specializing in action and period dramas.',
    },
    {
      id: 3,
      name: 'Fatima Al-Otaibi',
      stageName: 'Fay O.',
      location: 'Riyadh',
      age: 24,
      gender: 'Female',
      rating: 4.7,
      experience: 3,
      skills: ['Voice Acting', 'Singing', 'Acting'],
      languages: ['Arabic', 'English'],
      verified: true,
      profileViews: 189,
      activeApplications: 5,
      bio: 'Young talented voice actress with a passion for animation.',
    },
    {
      id: 4,
      name: 'Ahmed Al-Ghamdi',
      stageName: 'Ahmed G.',
      location: 'Dammam',
      age: 42,
      gender: 'Male',
      rating: 4.6,
      experience: 15,
      skills: ['Acting', 'Directing', 'Theater'],
      languages: ['Arabic'],
      verified: false,
      profileViews: 312,
      activeApplications: 1,
      bio: 'Experienced theater actor and director with extensive classical training.',
    },
    {
      id: 5,
      name: 'Noura Al-Mansour',
      stageName: 'Noura M.',
      location: 'Riyadh',
      age: 31,
      gender: 'Female',
      rating: 4.9,
      experience: 8,
      skills: ['Acting', 'Voice Acting', 'Dancing', 'Singing'],
      languages: ['Arabic', 'English', 'Spanish'],
      verified: true,
      profileViews: 528,
      activeApplications: 4,
      bio: 'Multi-talented performer with experience across various media.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Discover Talent</h1>
          <p className="text-muted-foreground">
            Find verified talent across Saudi Arabia for your next production
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name, skills, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            {/* Filter Button */}
            <Button variant="outline" className="h-12">
              <Filter className="w-5 h-5 mr-2" />
              Advanced Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {['all', 'verified', 'voice_acting', 'experienced', 'available'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
              >
                {filter.replace('_', ' ').charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{talents.length}</span> talented professionals
          </p>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talents.map((talent) => (
            <Card key={talent.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {talent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground truncate flex items-center gap-1">
                      {talent.stageName}
                      {talent.verified && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{talent.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{talent.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{talent.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-foreground mb-4 line-clamp-2">
                  {talent.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-sm font-semibold text-foreground">{talent.experience} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profile Views</p>
                    <p className="text-sm font-semibold text-foreground">{talent.profileViews}</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.slice(0, 3).map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {talent.skills.length > 3 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                        +{talent.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {talent.languages.map((language, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-xs font-medium"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/talent/${talent.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                  </Link>
                  <Button size="sm" className="flex-1">
                    <Mail className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            Load More Talent
          </Button>
        </div>
      </div>
    </div>
  );
}
