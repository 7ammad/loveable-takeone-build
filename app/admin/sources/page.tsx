'use client';

/**
 * Admin Sources Management
 */
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Instagram, Globe, CheckCircle, XCircle, Plus, Trash2, AlertCircle } from 'lucide-react';
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

interface Source {
  id: string;
  sourceType: string;
  sourceIdentifier: string;
  sourceName: string;
  lastProcessedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function SourcesManagement() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({
    sourceType: 'INSTAGRAM',
    sourceIdentifier: '',
    sourceName: '',
  });
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: Source[] }>('/api/v1/admin/sources');
      setSources(data.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch sources:', err);
      setError(err.response?.data?.error || 'Failed to fetch sources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/v1/admin/sources/${id}`, {
        isActive: !currentStatus,
      });
      fetchSources();
    } catch (err: any) {
      console.error('Failed to toggle source:', err);
      setError(err.response?.data?.error || 'Failed to toggle source status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiClient.post('/api/v1/admin/sources', newSource);
      setNewSource({ sourceType: 'INSTAGRAM', sourceIdentifier: '', sourceName: '' });
      setShowAddForm(false);
      fetchSources();
    } catch (err: any) {
      console.error('Failed to add source:', err);
      setError(err.response?.data?.error || 'Failed to add source.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/api/v1/admin/sources/${id}`);
      fetchSources();
      setDeletingSourceId(null);
    } catch (err: any) {
      console.error('Failed to delete source:', err);
      setError(err.response?.data?.error || 'Failed to delete source.');
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = sources.filter((s) => s.isActive).length;
  const instagramCount = sources.filter((s) => s.sourceType === 'INSTAGRAM' && s.isActive).length;
  const webCount = sources.filter((s) => s.sourceType === 'WEB' && s.isActive).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Source Management</h1>
          <p className="text-gray-600">
            {activeCount} active • {instagramCount} Instagram • {webCount} Web
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Source
        </Button>
      </div>

      {error && (
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
      )}

      {/* Add Source Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Source</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSource} className="space-y-4">
              <div>
                <Label>Source Type</Label>
                <Select
                  value={newSource.sourceType}
                  onValueChange={(value) =>
                    setNewSource({ ...newSource, sourceType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                    <SelectItem value="WEB">Website</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source Identifier</Label>
                <Input
                  placeholder={
                    newSource.sourceType === 'INSTAGRAM'
                      ? '@username'
                      : 'https://example.com/jobs'
                  }
                  value={newSource.sourceIdentifier}
                  onChange={(e) =>
                    setNewSource({ ...newSource, sourceIdentifier: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Display Name</Label>
                <Input
                  placeholder="e.g., Saudi Casting Agency"
                  value={newSource.sourceName}
                  onChange={(e) =>
                    setNewSource({ ...newSource, sourceName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Source</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sources List */}
      <Card>
        <CardHeader>
          <CardTitle>All Sources</CardTitle>
          <CardDescription>Manage your casting call sources</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    source.isActive ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {source.sourceType === 'INSTAGRAM' ? (
                      <Instagram className="w-5 h-5 text-pink-600" />
                    ) : (
                      <Globe className="w-5 h-5 text-blue-600" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{source.sourceName}</span>
                        {source.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{source.sourceIdentifier}</p>
                      {source.lastProcessedAt && (
                        <p className="text-xs text-gray-500">
                          Last processed: {new Date(source.lastProcessedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={source.isActive ? 'outline' : 'default'}
                      onClick={() => handleToggleActive(source.id, source.isActive)}
                    >
                      {source.isActive ? (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeletingSourceId(source.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingSourceId} onOpenChange={(open) => !open && setDeletingSourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the source. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if(deletingSourceId) handleDeleteSource(deletingSourceId)
              }}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Deleting...' : 'Yes, Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

