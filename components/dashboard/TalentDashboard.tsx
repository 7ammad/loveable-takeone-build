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
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TalentDashboard() {
  const { user } = useAuth();

  // Mock data - replace with real API calls
  const stats = {
    activeApplications: 5,
    profileViews: 127,
    responseRate: 68,
    profileCompletion: 85,
  };

  const recentActivity = [
    {
      id: 1,
      type: 'application',
      title: 'Application viewed for "Lead Actor in Drama Series"',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      type: 'profile',
      title: 'Your profile was viewed by MBC Productions',
      timestamp: '5 hours ago',
    },
    {
      id: 3,
      type: 'application',
      title: 'Application status changed to "Under Review"',
      timestamp: '1 day ago',
    },
  ];

  const recommendedCalls = [
    {
      id: 1,
      title: 'Lead Actor for Historical Drama',
      company: 'Telfaz11',
      location: 'Riyadh',
      deadline: '5 days left',
    },
    {
      id: 2,
      title: 'Voice Actor for Animation',
      company: 'Manga Productions',
      location: 'Remote',
      deadline: '10 days left',
    },
    {
      id: 3,
      title: 'Supporting Role in Comedy Series',
      company: 'MBC Studios',
      location: 'Jeddah',
      deadline: '3 days left',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your casting journey
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Applications */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Applications</p>
                  <p className="text-3xl font-bold text-foreground">{stats.activeApplications}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2 this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Views */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Profile Views</p>
                  <p className="text-3xl font-bold text-foreground">{stats.profileViews}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15 this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-500" />
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
                  <p className="text-3xl font-bold text-foreground">{stats.responseRate}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats.responseRate}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
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
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                    <User className="w-8 h-8 text-primary" />
                    <span>Complete Profile</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-primary" />
                    <span>Browse Opportunities</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                    <Calendar className="w-8 h-8 text-primary" />
                    <span>Update Availability</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Recommended Casting Calls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recommended for You</CardTitle>
                  <Link href="/casting-calls" className="text-sm text-primary hover:underline">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedCalls.map((call) => (
                    <div key={call.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-sm text-foreground mb-2">{call.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{call.company}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{call.location}</span>
                        <span className="text-orange-600 font-medium">{call.deadline}</span>
                      </div>
                      <Button size="sm" className="w-full mt-3" variant="outline">
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
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

