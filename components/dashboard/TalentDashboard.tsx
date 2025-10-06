'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { 
  FileText, 
  Eye, 
  TrendingUp, 
  CheckCircle2,
  Search,
  User,
  Calendar,
  ArrowRight,
  Inbox,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { ProfileCompletion } from '@/components/ui/profile-completion';
import { calculateTalentProfileCompletion } from '@/lib/utils/profile-completion';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { TalentProfile } from '@/lib/types';
import { ProfileCompletionStep } from '@/components/ui/profile-completion';

interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  profileViews: number;
  profileCompletion: number;
}

interface ApplicationStats {
  pending: number;
  underReview: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
  successRate: string;
  responseRate: string;
}

interface RecentApplication {
  id: string;
  castingCallId: string;
  title: string;
  company: string | null;
  location: string | null;
  status: string;
  appliedDate: Date;
}

export default function TalentDashboard() {
  const { user } = useAuth();
  const [profileCompletion, setProfileCompletion] = useState<{ percentage: number; steps: ProfileCompletionStep[] }>({ percentage: 0, steps: [] });
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    activeApplications: 0,
    profileViews: 0,
    profileCompletion: 0,
  });
  const [applicationStats, setApplicationStats] = useState<ApplicationStats>({
    pending: 0,
    underReview: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0,
    successRate: '0%',
    responseRate: '0%',
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await apiClient.get<{ success: boolean; data: TalentProfile | null }>('/api/v1/profiles/me');
        const data = response.data;
        if (data.success) {
          const profile = data.data || null;
          
          // Calculate completion
          const completion = calculateTalentProfileCompletion(profile);
          setProfileCompletion(completion);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Set default empty completion
        setProfileCompletion({ percentage: 0, steps: [] });
      }
    }

    if (user?.role === 'talent') {
      fetchProfile();
    }
  }, [user]);

  // Fetch dashboard analytics
  useEffect(() => {
    async function fetchAnalytics() {
      if (user?.role !== 'talent') return;

      try {
        setLoading(true);
        
        const response = await apiClient.get<{
          success: boolean;
          data: {
            overview: DashboardStats;
            applicationStats: ApplicationStats;
            recentApplications: RecentApplication[];
          };
        }>('/api/v1/analytics/talent-dashboard');

        if (response.data.success) {
          setStats(response.data.data.overview);
          setApplicationStats(response.data.data.applicationStats);
          setRecentApplications(response.data.data.recentApplications);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      case 'shortlisted': return 'text-green-600 bg-green-100';
      case 'accepted': return 'text-green-700 bg-green-200';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under_review': return <AlertCircle className="w-4 h-4" />;
      case 'shortlisted': return <CheckCircle2 className="w-4 h-4" />;
      case 'accepted': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your casting journey
        </p>
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
              {/* Total Applications */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalApplications}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.activeApplications} active
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Success Rate */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                      <p className="text-3xl font-bold text-foreground">{applicationStats.successRate}</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {applicationStats.accepted} accepted
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Rate */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Response Rate</p>
                      <p className="text-3xl font-bold text-foreground">{applicationStats.responseRate}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: applicationStats.responseRate }}
                        />
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Completion */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Profile Completion</p>
                      <p className="text-3xl font-bold text-foreground">{stats.profileCompletion}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${stats.profileCompletion}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
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
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/profile/edit" aria-label="Complete Profile">
                    <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
                      <User className="w-8 h-8 text-primary" />
                      <span>Complete Profile</span>
                    </Button>
                  </Link>
                  <Link href="/casting-calls" aria-label="Browse Opportunities">
                    <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-primary" />
                      <span>Browse Opportunities</span>
                    </Button>
                  </Link>
                  <Link href="/applications" aria-label="My Applications">
                    <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
                      <Calendar className="w-8 h-8 text-primary" />
                      <span>My Applications</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Application Status Breakdown */}
            {!loading && stats.totalApplications > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-2xl font-bold">{applicationStats.pending}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-2xl font-bold">{applicationStats.underReview}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Under Review</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-2xl font-bold">{applicationStats.shortlisted}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Shortlisted</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-700" />
                        <span className="text-2xl font-bold">{applicationStats.accepted}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Accepted</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-2xl font-bold">{applicationStats.rejected}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-primary/5">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold">{stats.activeApplications}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Applications</CardTitle>
                  <Link href="/applications" className="text-sm text-primary hover:underline">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <EmptyState
                    icon={<Inbox className="w-8 h-8" />}
                    title="No applications yet"
                    description="Start applying to casting calls to see your activity here"
                    action={
                      <Link href="/casting-calls">
                        <Button>Browse Casting Calls</Button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                        </div>
                        <div className="flex-1">
                          <Link href={`/casting-calls/${application.castingCallId}`}>
                            <p className="text-sm text-foreground font-medium hover:text-primary cursor-pointer">{application.title}</p>
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            {application.company && `${application.company} • `}
                            {application.location && `${application.location} • `}
                            {formatDate(application.appliedDate)}
                          </p>
                          <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </span>
                        </div>
                      </div>
                    ))}
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

            {/* Quick Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Complete your profile</p>
                    <p className="text-xs text-muted-foreground">
                      Profiles with 100% completion get 3x more views!
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/5 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Apply early</p>
                    <p className="text-xs text-muted-foreground">
                      Applications submitted in the first 48 hours have higher response rates.
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/5 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Customize your application</p>
                    <p className="text-xs text-muted-foreground">
                      Tailored cover letters increase your chances by 60%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browse Casting Calls CTA */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Find Your Next Role</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse hundreds of casting opportunities tailored to your skills.
                </p>
                <Link href="/casting-calls">
                  <Button className="w-full">
                    <span>Browse Opportunities</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
