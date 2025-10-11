'use client';

/**
 * Admin Validation Queue - Review scraped casting calls
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Save, 
  Clock,
  AlertCircle,
  ArrowLeft,
  Search
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CastingCall {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  projectType?: string;
  roles?: string;
  requirements?: string;
  compensation?: string;
  deadline?: string;
  sourceUrl?: string;
  isAggregated: boolean;
  status: string;
  createdAt: string;
}

export default function ValidationQueuePage() {
  const [pendingCalls, setPendingCalls] = useState<CastingCall[]>([]);
  const [selectedCall, setSelectedCall] = useState<CastingCall | null>(null);
  const [editedCall, setEditedCall] = useState<Partial<CastingCall> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  
  // Bulk actions state
  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  const fetchPendingCalls = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<{ data: CastingCall[] }>(
        '/api/v1/admin/casting-calls/pending'
      );
      setPendingCalls(data.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Admin access required');
      } else {
        setError('Failed to fetch pending casting calls');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCalls();
  }, []);

  const handleSelectCall = (call: CastingCall) => {
    setSelectedCall(call);
    setEditedCall({ ...call });
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    if (!editedCall) return;
    setEditedCall({ ...editedCall, [field]: e.target.value });
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/api/v1/admin/casting-calls/${id}/approve`);
      await fetchPendingCalls();
      setSelectedCall(null);
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleReject = async (id: string) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/api/v1/admin/casting-calls/${id}/reject`);
      await fetchPendingCalls();
      setSelectedCall(null);
    } catch (err) {
      console.error('Failed to reject:', err);
      // Display a toast or error message to the user
      setError(`Failed to reject call ${id}. Please try again.`);
    } finally {
      setActionLoading(false);
      setIsRejecting(null);
    }
  };
  
  const handleEditAndApprove = async (id: string) => {
    if (!editedCall) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/v1/admin/casting-calls/${id}/edit`, editedCall);
      await handleApprove(id);
    } catch (err: any) {
      console.error('Failed to save changes:', err);
      setError(err.response?.data?.error || 'Failed to save and approve. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk actions
  const handleToggleCallSelection = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedCalls);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedCalls(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCalls(new Set(filteredCalls.map(call => call.id)));
    } else {
      setSelectedCalls(new Set());
    }
  };

  const handleBulkApprove = async () => {
    if (selectedCalls.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const promises = Array.from(selectedCalls).map(id => 
        apiClient.post(`/api/v1/admin/casting-calls/${id}/approve`)
      );
      await Promise.all(promises);
      
      setSelectedCalls(new Set());
      await fetchPendingCalls();
    } catch (err: any) {
      console.error('Bulk approve failed:', err);
      setError('Failed to approve some calls. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedCalls.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const promises = Array.from(selectedCalls).map(id => 
        apiClient.post(`/api/v1/admin/casting-calls/${id}/reject`)
      );
      await Promise.all(promises);
      
      setSelectedCalls(new Set());
      await fetchPendingCalls();
    } catch (err: any) {
      console.error('Bulk reject failed:', err);
      setError('Failed to reject some calls. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Filtering logic
  const filteredCalls = pendingCalls.filter(call => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      call.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Source filter
    const matchesSource = filterSource === 'all' || 
      (filterSource === 'whatsapp' && call.sourceUrl?.includes('whatsapp')) ||
      (filterSource === 'web' && call.sourceUrl?.includes('http')) ||
      (filterSource === 'instagram' && call.sourceUrl?.includes('instagram'));

    // Date filter
    const matchesDate = filterDate === 'all' || 
      (filterDate === 'today' && new Date(call.createdAt).toDateString() === new Date().toDateString()) ||
      (filterDate === 'week' && (Date.now() - new Date(call.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000);

    return matchesSearch && matchesSource && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="col-span-2 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button onClick={() => setError(null)} variant="ghost" size="sm" className="mt-2 text-red-700">
              Dismiss
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild size="sm">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mt-2">Validation Queue</h1>
          <p className="text-gray-600">
            {filteredCalls.length} casting call{filteredCalls.length !== 1 ? 's' : ''} pending review
            {selectedCalls.size > 0 && ` (${selectedCalls.size} selected)`}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by title, company, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Sources</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="web">Web</option>
            <option value="instagram">Instagram</option>
          </select>
          
          {/* Date Filter */}
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedCalls.size > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedCalls.size} selected
            </span>
            <Button
              onClick={handleBulkApprove}
              disabled={bulkActionLoading}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve All
            </Button>
            <Button
              onClick={handleBulkReject}
              disabled={bulkActionLoading}
              size="sm"
              variant="destructive"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject All
            </Button>
            <Button
              onClick={() => setSelectedCalls(new Set())}
              size="sm"
              variant="outline"
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {filteredCalls.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-gray-600">No casting calls pending review at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending ({filteredCalls.length})</CardTitle>
                  <CardDescription>Click to review</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCalls.size === filteredCalls.length && filteredCalls.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-500">Select All</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
              {filteredCalls.map((call) => {
                const isSelected = selectedCalls.has(call.id);
                const sourceType = call.sourceUrl?.includes('whatsapp') ? 'WhatsApp' : 
                                 call.sourceUrl?.includes('instagram') ? 'Instagram' : 'Web';
                
                return (
                  <div
                    key={call.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCall?.id === call.id
                        ? 'border-blue-500 bg-blue-50'
                        : isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleCallSelection(call.id, e.target.checked);
                        }}
                        className="mt-1 rounded"
                      />
                      <div 
                        className="flex-1"
                        onClick={() => handleSelectCall(call)}
                      >
                        <h4 className="font-medium text-sm mb-1">{call.title}</h4>
                        <p className="text-xs text-gray-600">{call.company}</p>
                        <p className="text-xs text-gray-500 mt-1">{call.location}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {sourceType}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(call.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Review Panel */}
          <div className="lg:col-span-2">
            {selectedCall && editedCall ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle>Review Casting Call</CardTitle>
                      <CardDescription className="mt-2">
                        {selectedCall.sourceUrl && (
                          <a
                            href={selectedCall.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Original Source
                          </a>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={editedCall.title || ''}
                      onChange={(e) => handleInputChange(e, 'title')}
                    />
                  </div>

                  <div>
                    <Label>Company *</Label>
                    <Input
                      value={editedCall.company || ''}
                      onChange={(e) => handleInputChange(e, 'company')}
                    />
                  </div>

                  <div>
                    <Label>Location *</Label>
                    <Input
                      value={editedCall.location || ''}
                      onChange={(e) => handleInputChange(e, 'location')}
                    />
                  </div>

                  <div>
                    <Label>Project Type</Label>
                    <Input
                      value={editedCall.projectType || ''}
                      onChange={(e) => handleInputChange(e, 'projectType')}
                      placeholder="e.g., Film, TV Series, Commercial"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editedCall.description || ''}
                      onChange={(e) => handleInputChange(e, 'description')}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Roles</Label>
                    <Textarea
                      value={editedCall.roles || ''}
                      onChange={(e) => handleInputChange(e, 'roles')}
                      rows={3}
                      placeholder="e.g., Lead Actor, Supporting Actress"
                    />
                  </div>

                  <div>
                    <Label>Requirements</Label>
                    <Textarea
                      value={editedCall.requirements || ''}
                      onChange={(e) => handleInputChange(e, 'requirements')}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Compensation</Label>
                    <Input
                      value={editedCall.compensation || ''}
                      onChange={(e) => handleInputChange(e, 'compensation')}
                      placeholder="e.g., SAR 5,000 - 10,000"
                    />
                  </div>

                  <div>
                    <Label>Application Deadline</Label>
                    <Input
                      type="date"
                      value={editedCall.deadline || ''}
                      onChange={(e) => handleInputChange(e, 'deadline')}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
                    <Button
                      onClick={() => handleApprove(selectedCall.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve as is
                    </Button>
                    <Button
                      onClick={() => handleEditAndApprove(selectedCall.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save & Approve
                    </Button>
                    <Button
                      onClick={() => setIsRejecting(selectedCall.id)}
                      disabled={actionLoading}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a casting call from the list to review</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
      
      <AlertDialog open={!!isRejecting} onOpenChange={(open) => !open && setIsRejecting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently reject the casting call. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if(isRejecting) handleReject(isRejecting)
              }}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Rejecting...' : 'Yes, Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
