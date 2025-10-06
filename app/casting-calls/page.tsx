'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { LandingHeader } from '@/components/Header';
import { DashboardNav } from '@/components/DashboardNav';
import { useAuth } from '@/lib/contexts/auth-context';

export default function CastingCallsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - replace with real API call
  const castingCalls = [
    {
      id: 1,
      title: 'Lead Actor for Historical Drama Series',
      company: 'MBC Studios',
      location: 'Riyadh',
      compensation: 'SAR 50,000 - 80,000',
      deadline: '2025-10-15',
      description: 'Seeking an experienced male actor for a leading role in our upcoming historical drama series.',
      requirements: 'Male, 30-45 years old, fluent in Arabic',
      isVerified: true,
      daysLeft: 5,
      applicants: 15,
    },
    {
      id: 2,
      title: 'Voice Actor for Animated Series',
      company: 'Manga Productions',
      location: 'Remote',
      compensation: 'SAR 30,000 - 50,000',
      deadline: '2025-10-20',
      description: 'Looking for talented voice actors for our new animated series project.',
      requirements: 'Experience in voice acting, Arabic and English fluency',
      isVerified: true,
      daysLeft: 10,
      applicants: 22,
    },
    {
      id: 3,
      title: 'Supporting Role in Comedy Series',
      company: 'Telfaz11',
      location: 'Jeddah',
      compensation: 'SAR 40,000 - 60,000',
      deadline: '2025-10-12',
      description: 'We are casting for a supporting role in our upcoming comedy series.',
      requirements: 'Female, 25-35 years old, comedy experience preferred',
      isVerified: true,
      daysLeft: 3,
      applicants: 8,
    },
    {
      id: 4,
      title: 'Commercial Advertisement Actor',
      company: 'Creative Hub Agency',
      location: 'Riyadh',
      compensation: 'SAR 20,000 - 35,000',
      deadline: '2025-10-18',
      description: 'Seeking actors for a major brand commercial campaign.',
      requirements: 'Any gender, 20-40 years old, photogenic',
      isVerified: false,
      daysLeft: 8,
      applicants: 31,
    },
    {
      id: 5,
      title: 'Theater Performance Lead',
      company: 'King Abdullah Cultural Center',
      location: 'Dhahran',
      compensation: 'SAR 45,000 - 70,000',
      deadline: '2025-10-25',
      description: 'Lead role in a classical theater production.',
      requirements: 'Theater experience, strong stage presence',
      isVerified: true,
      daysLeft: 15,
      applicants: 12,
    },
    {
      id: 6,
      title: 'Documentary Narrator',
      company: 'Saudi Film Commission',
      location: 'Riyadh',
      compensation: 'SAR 25,000 - 40,000',
      deadline: '2025-10-22',
      description: 'Professional narrator needed for documentary series about Saudi heritage.',
      requirements: 'Clear Arabic voice, narration experience',
      isVerified: true,
      daysLeft: 12,
      applicants: 18,
    },
  ];

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 3) return 'text-red-600 bg-red-50 border-red-200';
    if (daysLeft <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <>
      {user ? <DashboardNav /> : <LandingHeader />}
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Casting Opportunities</h1>
            <p className="text-muted-foreground">
              Discover your next role from verified casting calls across Saudi Arabia
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
                placeholder="Search by title, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            {/* Filter Button */}
            <Button variant="outline" className="h-12">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {['all', 'verified', 'remote', 'urgent'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{castingCalls.length}</span> casting opportunities
          </p>
        </div>

        {/* Casting Calls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {castingCalls.map((call) => (
            <Card key={call.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Status Indicator */}
              <div className={`h-1 ${call.isVerified ? 'bg-green-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`} />
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <Link href={`/casting-calls/${call.id}`}>
                      <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors line-clamp-2">
                        {call.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      {call.company}
                      {call.isVerified && (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-xs">Verified</span>
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {/* Urgency Badge */}
                  <div className={`px-3 py-1 rounded-full border ${getUrgencyColor(call.daysLeft)}`}>
                    <span className="text-xs font-medium">{call.daysLeft} days left</span>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{call.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="truncate">{call.compensation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(call.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{call.applicants} applicants</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground mb-4 line-clamp-2">
                  {call.description}
                </p>

                {/* Requirements */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Requirements</p>
                  <p className="text-sm text-foreground line-clamp-1">
                    {call.requirements}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link href={`/casting-calls/${call.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/casting-calls/${call.id}/apply`} className="flex-1">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              // TODO: Implement pagination logic
              alert('Pagination coming soon! This will load more casting opportunities.');
            }}
          >
            Load More Opportunities
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}

