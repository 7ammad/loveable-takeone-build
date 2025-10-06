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
  Eye,
  Edit,
  Trash2,
  Users,
  Clock,
  Plus,
  MoreVertical
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Application {
  id: string;
  status: string;
  createdAt: string;
}

interface CastingCall {
  id: string;
  title: string;
  description: string;
  location: string;
  compensation?: string;
  deadline?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  applications?: Application[];
}

export default function ManageCastingCallsPage() {
  const [castingCalls, setCastingCalls] = useState<CastingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch casting calls
  useEffect(() => {
    async function fetchCastingCalls() {
      try {
        setLoading(true);
        const response = await apiClient.get<{ 
          success: boolean; 
          data: {
            castingCalls: CastingCall[];
            pagination: any;
          }
        }>('/api/v1/casting-calls?myCallsOnly=true');
        
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

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: {
        label: 'Draft',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
      },
      published: {
        label: 'Published',
        color: 'bg-green-100 text-green-800 border-green-200',
      },
      closed: {
        label: 'Closed',
        color: 'bg-red-100 text-red-800 border-red-200',
      },
      pending_review: {
        label: 'Pending Review',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
    };
    return configs[status as keyof typeof configs] || configs.draft;
  };

  const filteredCastingCalls = castingCalls.filter(call => {
    const matchesSearch = call.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         call.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || call.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: castingCalls.length,
    draft: castingCalls.filter(c => c.status === 'draft').length,
    published: castingCalls.filter(c => c.status === 'published').length,
    closed: castingCalls.filter(c => c.status === 'closed').length,
    pending_review: castingCalls.filter(c => c.status === 'pending_review').length,
  };

  const handleStatusChange = async (castingCallId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/api/v1/casting-calls/${castingCallId}`, {
        status: newStatus,
      });
      
      // Update local state
      setCastingCalls(prev => prev.map(call => 
        call.id === castingCallId ? { ...call, status: newStatus } : call
      ));
    } catch (error) {
      console.error('Failed to update casting call status:', error);
    }
  };

  const handleDelete = async (castingCallId: string) => {
    if (!confirm('Are you sure you want to delete this casting call? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/casting-calls/${castingCallId}`);
      
      // Remove from local state
      setCastingCalls(prev => prev.filter(call => call.id !== castingCallId));
    } catch (error) {
      console.error('Failed to delete casting call:', error);
    }
  };


  const getDaysUntilDeadline = (deadline: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <ProtectedRoute requiredRole="caster">
      <div className="min-h-screen bg-background">
        <DashboardNav />
        
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Manage Casting Calls</h1>
                <p className="text-muted-foreground">
                  View, edit, and manage all your casting calls
                </p>
              </div>
              <Link href="/casting-calls/create">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Call
                </Button>
              </Link>
            </div>
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
                  placeholder="Search by title or location..."
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
              Showing <span className="font-semibold text-foreground">{filteredCastingCalls.length}</span> casting calls
            </p>
          </div>

          {/* Casting Calls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                      <div className="h-10 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredCastingCalls.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No casting calls found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || selectedStatus !== 'all' 
                      ? 'Try adjusting your filters or search query'
                      : 'You haven\'t created any casting calls yet'}
                  </p>
                  {!searchQuery && selectedStatus === 'all' && (
                    <Link href="/casting-calls/create">
                      <Button>Create Your First Casting Call</Button>
                    </Link>
                  )}
                </Card>
              </div>
            ) : (
              filteredCastingCalls.map((castingCall) => {
                const statusConfig = getStatusConfig(castingCall.status);
                const daysUntilDeadline = castingCall.deadline ? getDaysUntilDeadline(castingCall.deadline) : null;
                const applicationCount = castingCall.applications?.length || 0;

                return (
                  <Card key={castingCall.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-bold text-foreground line-clamp-2">
                          {castingCall.title}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/casting-calls/${castingCall.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/casting-calls/${castingCall.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/casting-calls/${castingCall.id}/applications`}>
                                <Users className="w-4 h-4 mr-2" />
                                Applications
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(castingCall.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Badge className={`${statusConfig.color} w-fit`}>
                        {statusConfig.label}
                      </Badge>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Description Preview */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {castingCall.description}
                      </p>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{castingCall.location}</span>
                        </div>
                        
                        {castingCall.compensation && (
                          <div className="text-sm font-medium text-foreground">
                            {castingCall.compensation}
                          </div>
                        )}
                        
                        {daysUntilDeadline !== null && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>
                              {daysUntilDeadline > 0 
                                ? `${daysUntilDeadline} days left`
                                : daysUntilDeadline === 0 
                                ? 'Deadline today'
                                : `${Math.abs(daysUntilDeadline)} days overdue`
                              }
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{applicationCount} applications</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/casting-calls/${castingCall.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        
                        <Link href={`/casting-calls/${castingCall.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                      
                      {/* Status Actions */}
                      {castingCall.status === 'published' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => handleStatusChange(castingCall.id, 'closed')}
                        >
                          Close Call
                        </Button>
                      )}
                      
                      {castingCall.status === 'closed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => handleStatusChange(castingCall.id, 'published')}
                        >
                          Reopen Call
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
