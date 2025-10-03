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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HirerDashboard() {
  const { user } = useAuth();

  // Mock data - replace with real API calls
  const stats = {
    activeCastingCalls: 3,
    totalApplications: 42,
    shortlisted: 8,
    avgResponseTime: '2.5h',
  };

  const recentApplications = [
    {
      id: 1,
      talentName: 'Sarah Al-Ahmed',
      role: 'Lead Actress',
      appliedDate: '2 hours ago',
      status: 'pending',
    },
    {
      id: 2,
      talentName: 'Mohammed Al-Rashid',
      role: 'Supporting Actor',
      appliedDate: '5 hours ago',
      status: 'under_review',
    },
    {
      id: 3,
      talentName: 'Fatima Al-Otaibi',
      role: 'Voice Actor',
      appliedDate: '1 day ago',
      status: 'shortlisted',
    },
  ];

  const activeCalls = [
    {
      id: 1,
      title: 'Lead Actress for Drama Series',
      deadline: '5 days',
      applications: 15,
      status: 'published',
    },
    {
      id: 2,
      title: 'Voice Actor for Animation',
      deadline: '10 days',
      applications: 22,
      status: 'published',
    },
    {
      id: 3,
      title: 'Supporting Role in Comedy',
      deadline: '3 days',
      applications: 5,
      status: 'published',
    },
  ];

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-background border-b">
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
            <Button size="lg" className="hidden md:flex">
              <Plus className="w-5 h-5 mr-2" />
              Post New Casting Call
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <Button className="h-auto py-6 flex flex-col items-center gap-2">
                    <Plus className="w-8 h-8" />
                    <span>Post Casting Call</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                    <Users className="w-8 h-8 text-primary" />
                    <span>View Applications</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-primary" />
                    <span>Search Talent</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Talent</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium">Applied</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((application) => (
                        <tr key={application.id} className="border-b last:border-0">
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
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Active Casting Calls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Casting Calls</CardTitle>
                  <Link href="/casting-calls" className="text-sm text-primary hover:underline">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeCalls.map((call) => (
                    <div key={call.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
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
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" className="flex-1">
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

