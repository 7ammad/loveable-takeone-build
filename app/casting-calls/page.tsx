'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { LandingHeader } from '@/components/Header';
import { DashboardNav } from '@/components/DashboardNav';
import { useAuth } from '@/lib/contexts/auth-context';
import { apiClient } from '@/lib/api/client';

interface CastingCall {
  id: string;
  title: string;
  description: string;
  location: string;
  compensation?: string;
  deadline?: string;
  company?: string;
  requirements?: string;
  status: string;
  createdAt: string;
  isAggregated?: boolean;
}

export default function CastingCallsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [castingCalls, setCastingCalls] = useState<CastingCall[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch casting calls from API
  useEffect(() => {
    async function fetchCastingCalls() {
      try {
        setLoading(true);
        const response = await apiClient.get<{
          success: boolean;
          data: {
            castingCalls: CastingCall[];
            pagination: any;
          };
        }>('/api/v1/casting-calls');
        
        if (response.data.success && response.data.data?.castingCalls) {
          setCastingCalls(response.data.data.castingCalls);
        }
      } catch (error) {
        console.error('Failed to fetch casting calls:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCastingCalls();
  }, []);

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 3) return 'text-red-600 bg-red-50 border-red-200';
    if (daysLeft <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  // Filter and search logic
  const filteredCalls = castingCalls.filter(call => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      call.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.company?.toLowerCase().includes(searchQuery.toLowerCase());

    // Quick filter
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'verified') return matchesSearch && !call.isAggregated;
    if (selectedFilter === 'remote') return matchesSearch && call.location?.toLowerCase().includes('remote');
    if (selectedFilter === 'urgent') {
      if (!call.deadline) return false;
      const daysLeft = getDaysUntilDeadline(call.deadline);
      return matchesSearch && daysLeft <= 7;
    }
    
    return matchesSearch;
  });

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
            Showing <span className="font-semibold text-foreground">{filteredCalls.length}</span> casting opportunities
          </p>
        </div>

        {/* Casting Calls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="h-20 bg-muted rounded w-full mb-4"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </div>
                </div>
              </Card>
            ))
          ) : filteredCalls.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No casting calls found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedFilter !== 'all' 
                    ? 'Try adjusting your filters or search query'
                    : 'No casting opportunities available at the moment'}
                </p>
              </Card>
            </div>
          ) : (
            filteredCalls.map((call) => {
              const daysLeft = call.deadline ? getDaysUntilDeadline(call.deadline) : null;
              const isVerified = !call.isAggregated;
              
              return (
            <Card key={call.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Status Indicator */}
              <div className={`h-1 ${isVerified ? 'bg-green-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`} />
              
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
                      {call.company || 'Company not specified'}
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-xs">Verified</span>
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {/* Urgency Badge */}
                  {daysLeft !== null && (
                    <div className={`px-3 py-1 rounded-full border ${getUrgencyColor(daysLeft)}`}>
                      <span className="text-xs font-medium">
                        {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Today' : 'Expired'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{call.location || 'Location TBD'}</span>
                  </div>
                  {call.compensation && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="truncate">{call.compensation}</span>
                    </div>
                  )}
                  {call.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(call.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-foreground mb-4 line-clamp-2">
                  {call.description || 'No description provided'}
                </p>

                {/* Requirements */}
                {call.requirements && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Requirements</p>
                    <p className="text-sm text-foreground line-clamp-1">
                      {call.requirements}
                    </p>
                  </div>
                )}

                {/* Actions - Role Aware */}
                <div className="flex gap-3">
                  <Link href={`/casting-calls/${call.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  {user?.role === 'talent' ? (
                    <Link href={`/casting-calls/${call.id}/apply`} className="flex-1">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Apply Now
                      </Button>
                    </Link>
                  ) : user?.role === 'caster' ? (
                    <Link href={`/casting-calls/${call.id}/edit`} className="flex-1">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Edit
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </Card>
              );
            })
          )}
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

