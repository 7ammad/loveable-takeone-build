'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookAudition } from '@/components/booking/BookAudition';
import { 
  Search, 
  Calendar,
  Eye,
  UserCheck,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

interface Application {
  id: string;
  castingCallId: string;
  castingCallTitle: string;
  talentUserId: string;
  talentName: string;
  talentEmail?: string;
  status: string;
  coverLetter: string;
  availability: string;
  contactPhone: string;
  headshotUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CasterApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showBooking, setShowBooking] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState({ name: '', email: '' });

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await apiClient.get<{ success: boolean; data: { name: string; email: string } }>('/api/v1/profiles/me');
        if (response.data.success) {
          setCurrentUser({
            name: response.data.data.name || '',
            email: response.data.data.email || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    }
    fetchUser();
  }, []);

  // Fetch applications for caster's casting calls
  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true);
        
        // First, get all casting calls for this caster
        const castingCallsResponse = await apiClient.get<{ 
          success: boolean; 
          data: {
            castingCalls: Array<{ id: string; title: string }>;
            pagination: any;
          }
        }>('/api/v1/casting-calls');
        
        if (castingCallsResponse.data.success && castingCallsResponse.data.data?.castingCalls) {
          const castingCalls = castingCallsResponse.data.data.castingCalls;
          
          // Get applications for each casting call
          const allApplications: Application[] = [];
          
          for (const call of castingCalls) {
            try {
              const appsResponse = await apiClient.get<{ success: boolean; data: Application[] }>(`/api/v1/casting-calls/${call.id}/applications`);
              if (appsResponse.data.success && appsResponse.data.data) {
                const appsWithCallInfo = appsResponse.data.data.map((app: Application) => ({
                  ...app,
                  castingCallTitle: call.title,
                }));
                allApplications.push(...appsWithCallInfo);
              }
            } catch (error) {
              console.error(`Failed to fetch applications for casting call ${call.id}:`, error);
            }
          }
          
          setApplications(allApplications);
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
      },
      under_review: {
        label: 'Under Review',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: AlertCircle,
      },
      shortlisted: {
        label: 'Shortlisted',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2,
      },
      accepted: {
        label: 'Accepted',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2,
      },
      rejected: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.castingCallTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.talentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/api/v1/applications/${applicationId}/status`, {
        status: newStatus,
      });
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole="caster">
      <div className="min-h-screen bg-background">
        <DashboardNav />
        
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Applications</h1>
            <p className="text-muted-foreground">
              Review and manage applications for your casting calls
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by role or talent name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-background/20 text-xs">
                    {count}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredApplications.length}</span> applications
            </p>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                      <div className="h-10 bg-muted rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredApplications.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No applications found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedStatus !== 'all' 
                    ? 'Try adjusting your filters or search query'
                    : 'No applications have been submitted to your casting calls yet'}
                </p>
                {!searchQuery && selectedStatus === 'all' && (
                  <Link href="/casting-calls/create">
                    <Button>Create Your First Casting Call</Button>
                  </Link>
                )}
              </Card>
            ) : (
              filteredApplications.map((application) => {
                const statusConfig = getStatusConfig(application.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={application.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-1">
                            {application.castingCallTitle}
                          </h3>
                          <p className="text-sm text-muted-foreground">Applied by {application.talentName}</p>
                        </div>

                        {/* Status Badge */}
                        <Badge className={`${statusConfig.color} flex items-center gap-2`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{application.availability}</span>
                        </div>
                      </div>

                      {/* Cover Letter Preview */}
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Cover Letter:</p>
                        <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                          {application.coverLetter.length > 200 
                            ? `${application.coverLetter.substring(0, 200)}...` 
                            : application.coverLetter}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(application.id, 'shortlisted')}
                          disabled={application.status === 'shortlisted' || application.status === 'accepted'}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Shortlist
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(application.id, 'accepted')}
                          disabled={application.status === 'accepted'}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(application.id, 'rejected')}
                          disabled={application.status === 'rejected'}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => setShowBooking(application.id)}
                          disabled={application.status === 'rejected'}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Audition
                        </Button>
                        
                        <div className="flex-1" />
                        
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      {showBooking && (
        <Dialog open={!!showBooking} onOpenChange={() => setShowBooking(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Audition</DialogTitle>
            </DialogHeader>
            <BookAudition
              application={{
                id: applications.find(a => a.id === showBooking)?.id || '',
                castingCallTitle: applications.find(a => a.id === showBooking)?.castingCallTitle || '',
                talentName: applications.find(a => a.id === showBooking)?.talentName || '',
                talentEmail: applications.find(a => a.id === showBooking)?.talentEmail,
              }}
              casterName={currentUser.name}
              casterEmail={currentUser.email}
              onBookingComplete={(data) => {
                console.log('Booking created:', data);
                setShowBooking(null);
                // TODO: Show success message
                alert('Audition booked successfully! The talent will receive a confirmation email.');
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </ProtectedRoute>
  );
}
