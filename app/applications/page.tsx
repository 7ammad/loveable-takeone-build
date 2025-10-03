'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Filter,
  Calendar,
  MapPin,
  Eye,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data - replace with real API call
  const applications = [
    {
      id: 1,
      castingCallTitle: 'Lead Actor for Historical Drama Series',
      company: 'MBC Studios',
      location: 'Riyadh',
      appliedDate: '2025-10-01',
      status: 'under_review',
      deadline: '2025-10-15',
      compensation: 'SAR 50,000 - 80,000',
      notes: 'Your application is being reviewed by the casting team.',
    },
    {
      id: 2,
      castingCallTitle: 'Voice Actor for Animated Series',
      company: 'Manga Productions',
      location: 'Remote',
      appliedDate: '2025-09-28',
      status: 'shortlisted',
      deadline: '2025-10-20',
      compensation: 'SAR 30,000 - 50,000',
      notes: 'Congratulations! You have been shortlisted for the next round.',
    },
    {
      id: 3,
      castingCallTitle: 'Supporting Role in Comedy Series',
      company: 'Telfaz11',
      location: 'Jeddah',
      appliedDate: '2025-09-25',
      status: 'pending',
      deadline: '2025-10-12',
      compensation: 'SAR 40,000 - 60,000',
      notes: null,
    },
    {
      id: 4,
      castingCallTitle: 'Commercial Advertisement Actor',
      company: 'Creative Hub Agency',
      location: 'Riyadh',
      appliedDate: '2025-09-20',
      status: 'rejected',
      deadline: '2025-10-18',
      compensation: 'SAR 20,000 - 35,000',
      notes: 'Thank you for your interest. We have decided to move forward with other candidates.',
    },
    {
      id: 5,
      castingCallTitle: 'Theater Performance Lead',
      company: 'King Abdullah Cultural Center',
      location: 'Dhahran',
      appliedDate: '2025-09-15',
      status: 'accepted',
      deadline: '2025-10-25',
      compensation: 'SAR 45,000 - 70,000',
      notes: 'Congratulations! Your application has been accepted. We will contact you shortly.',
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        label: 'Pending',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: Clock,
      },
      under_review: {
        label: 'Under Review',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: AlertCircle,
      },
      shortlisted: {
        label: 'Shortlisted',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: CheckCircle2,
      },
      accepted: {
        label: 'Accepted',
        color: 'text-green-700 bg-green-100 border-green-300',
        icon: CheckCircle2,
      },
      rejected: {
        label: 'Rejected',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: XCircle,
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.castingCallTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <ProtectedRoute requiredRole="talent">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Applications</h1>
            <p className="text-muted-foreground">
              Track and manage your casting call applications
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
                  placeholder="Search by role or company..."
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
            {filteredApplications.map((application) => {
              const statusConfig = getStatusConfig(application.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={application.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <Link href={`/casting-calls/${application.id}`}>
                          <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors mb-1">
                            {application.castingCallTitle}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">{application.company}</p>
                      </div>

                      {/* Status Badge */}
                      <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{statusConfig.label}</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{application.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Deadline: {new Date(application.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {application.compensation}
                      </div>
                    </div>

                    {/* Notes */}
                    {application.notes && (
                      <div className="p-3 bg-muted/50 rounded-lg mb-4">
                        <p className="text-sm text-foreground">{application.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link href={`/casting-calls/${application.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Casting Call
                        </Button>
                      </Link>
                      {(application.status === 'pending' || application.status === 'under_review') && (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <X className="w-4 h-4 mr-2" />
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No applications found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedStatus !== 'all' 
                  ? 'Try adjusting your filters or search query'
                  : 'You haven\'t applied to any casting calls yet'}
              </p>
              {!searchQuery && selectedStatus === 'all' && (
                <Link href="/casting-calls">
                  <Button>Browse Casting Opportunities</Button>
                </Link>
              )}
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

