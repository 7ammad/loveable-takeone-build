'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { 
  Clapperboard, 
  Users, 
  UserCheck, 
  Clock,
  TrendingUp,
  Plus,
  Search,
  Edit,
  Eye,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { ProfileCompletion } from '@/components/ui/profile-completion';
import { calculateCasterProfileCompletion } from '@/lib/utils/profile-completion';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { CasterProfile } from '@/lib/types';
import { ProfileCompletionStep } from '@/components/ui/profile-completion';

export default function HirerDashboard() {
  const { user } = useAuth();
  const [profileCompletion, setProfileCompletion] = useState<{ percentage: number; steps: ProfileCompletionStep[] }>({ percentage: 0, steps: [] });

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await apiClient.get<{ success: boolean; data: CasterProfile | null }>('/api/v1/profiles/me');
        const data = response.data;
        if (data.success) {
          const profile = data.data || null;
          
          // Calculate completion
          const completion = calculateCasterProfileCompletion(profile);
          setProfileCompletion(completion);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Set default empty completion
        setProfileCompletion({ percentage: 0, steps: [] });
      }
    }

    if (user?.role === 'caster') {
      fetchProfile();
    }
  }, [user]);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      if (user?.role !== 'caster') return;
      
      try {
        setLoading(true);
        
        // Fetch casting calls (only my calls, including drafts)
        const castingCallsResponse = await apiClient.get<{ 
          success: boolean; 
          data: {
            castingCalls: Array<{
              id: string;
              title: string;
              status: string;
              deadline?: string | null;
              applications?: Array<{ status: string }>;
            }>;
            pagination: any;
          }
        }>('/api/v1/casting-calls?myCallsOnly=true');
        
        // Ensure we have a valid array
        const castingCalls = (castingCallsResponse.data.success && Array.isArray(castingCallsResponse.data.data?.castingCalls)) 
          ? castingCallsResponse.data.data.castingCalls 
          : [];
        
        // Filter active calls (published status) and drafts
        const active = castingCalls.filter(call => call.status === 'published');
        const drafts = castingCalls.filter(call => call.status === 'draft');
        
        // Transform data to match activeCalls interface
        const transformedCalls = [...active, ...drafts].map(call => ({
          id: call.id,
          title: call.title,
          deadline: call.deadline || '',
          applications: call.applications?.length || 0,
          status: call.status,
        }));
        
        setActiveCalls(transformedCalls); // Show both published and drafts
        
        // Fetch applications (we'll need to create this endpoint)
        // For now, we'll calculate stats from casting calls
        const totalApplications = active.reduce((sum, call) => sum + (call.applications?.length || 0), 0);
        const shortlisted = active.reduce((sum, call) => {
          return sum + (call.applications?.filter((app) => app.status === 'shortlisted').length || 0);
        }, 0);
        
        setStats({
          activeCastingCalls: active.length, // Only count published as "active"
          totalApplications,
          shortlisted,
          avgResponseTime: '2.5h', // Will calculate from real data later
        });
        
        // For recent applications, we'll create a mock structure for now
        // This will be replaced when we build the applications management system
        const mockApplications = active.slice(0, 3).map((call, index) => ({
          id: `${call.id}-${index}`,
          talentName: `Applicant ${index + 1}`,
          role: call.title,
          appliedDate: '2 hours ago',
          status: 'pending',
          castingCallId: call.id,
        }));
        setRecentApplications(mockApplications);
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  // Real data state
  const [stats, setStats] = useState({
    activeCastingCalls: 0,
    totalApplications: 0,
    shortlisted: 0,
    avgResponseTime: '0h',
  });
  const [recentApplications, setRecentApplications] = useState<Array<{
    id: string;
    talentName: string;
    role: string;
    appliedDate: string;
    status: string;
    castingCallId: string;
  }>>([]);
  const [activeCalls, setActiveCalls] = useState<Array<{
    id: string;
    title: string;
    deadline: string;
    applications: number;
    status: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      case 'shortlisted': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your casting calls and applications
            </p>
          </div>
          <Link href="/casting-calls/create">
            <Button size="lg" className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-5 h-5 mr-2" />
              Post New Casting Call
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
          <>
          {/* Active Casting Calls */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Casting Calls</p>
                  <p className="text-3xl font-bold text-foreground">{stats.activeCastingCalls}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +1 this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clapperboard className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Applications */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalApplications}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12 this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shortlisted */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Shortlisted Candidates</p>
                  <p className="text-3xl font-bold text-foreground">{stats.shortlisted}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ready for review
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg Response Time */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
                  <p className="text-3xl font-bold text-foreground">{stats.avgResponseTime}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Faster than average
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/casting-calls/create" className="flex-1">
                    <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="w-8 h-8" />
                      <span>Post Casting Call</span>
                    </Button>
                  </Link>
                  <Link href="/applications/caster" className="flex-1">
                    <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 border-secondary text-secondary hover:bg-secondary hover:text-foreground">
                      <Users className="w-8 h-8" />
                      <span>View Applications</span>
                    </Button>
                  </Link>
                  <Link href="/talent" className="flex-1">
                    <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 border-secondary text-secondary hover:bg-secondary hover:text-foreground">
                      <Search className="w-8 h-8" />
                      <span>Search Talent</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Recent Applications</CardTitle>
                  <Link href="/applications/caster" className="text-sm text-primary hover:underline">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <EmptyState
                    icon={<Inbox className="w-8 h-8" />}
                    title="No applications yet"
                    description="Post your first casting call to start receiving applications from talented individuals"
                    action={
                      <Link href="/casting-calls/create">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Post Casting Call
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-sm text-muted-foreground">
                          <th className="pb-3 font-medium">Talent</th>
                          <th className="pb-3 font-medium">Role</th>
                          <th className="pb-3 font-medium">Applied</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentApplications.map((application) => (
                          <tr key={application.id} className="border-b border-border last:border-0">
                            <td className="py-4 text-sm font-medium text-foreground">
                              {application.talentName}
                            </td>
                            <td className="py-4 text-sm text-muted-foreground">
                              {application.role}
                            </td>
                            <td className="py-4 text-sm text-muted-foreground">
                              {application.appliedDate}
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {getStatusLabel(application.status)}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className="text-foreground hover:text-primary">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-foreground hover:text-primary">
                                  <UserCheck className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Profile Completion Indicator */}
            {profileCompletion.percentage < 100 && (
              <ProfileCompletion
                steps={profileCompletion.steps}
                completionPercentage={profileCompletion.percentage}
              />
            )}

            {/* Active Casting Calls */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Active Casting Calls</CardTitle>
                  <Link href="/casting-calls/manage" className="text-sm text-primary hover:underline">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeCalls.map((call) => (
                    <div key={call.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all">
                      <h4 className="font-semibold text-sm text-foreground mb-2">{call.title}</h4>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {call.deadline} left
                        </span>
                        <span className="text-primary font-medium">
                          {call.applications} applications
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-secondary text-secondary hover:bg-secondary hover:text-foreground">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

