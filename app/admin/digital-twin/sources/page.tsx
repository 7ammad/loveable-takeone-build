'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ExternalLink, MessageSquare, Globe } from 'lucide-react';

interface IngestionSource {
  id: string;
  sourceType: 'WEB' | 'WHATSAPP';
  sourceIdentifier: string;
  sourceName: string;
  lastProcessedAt?: string;
  isActive: boolean;
  createdAt: string;
}

export default function DigitalTwinSourcesPage() {
  const [sources, setSources] = useState<IngestionSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IngestionSource | null>(null);

  // Form state
  const [sourceType, setSourceType] = useState<'WEB' | 'WHATSAPP'>('WEB');
  const [sourceIdentifier, setSourceIdentifier] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/admin/digital-twin/sources');
      if (response.ok) {
        const data = await response.json();
        setSources(data.sources);
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      sourceType,
      sourceIdentifier,
      sourceName,
      isActive,
    };

    try {
      const url = editingSource
        ? `/api/admin/digital-twin/sources/${editingSource.id}`
        : '/api/admin/digital-twin/sources';

      const method = editingSource ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchSources();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save source:', error);
    }
  };

  const handleEdit = (source: IngestionSource) => {
    setEditingSource(source);
    setSourceType(source.sourceType);
    setSourceIdentifier(source.sourceIdentifier);
    setSourceName(source.sourceName);
    setIsActive(source.isActive);
    setDialogOpen(true);
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;

    try {
      const response = await fetch(`/api/admin/digital-twin/sources/${sourceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSources();
      }
    } catch (error) {
      console.error('Failed to delete source:', error);
    }
  };

  const handleToggleActive = async (source: IngestionSource) => {
    try {
      const response = await fetch(`/api/admin/digital-twin/sources/${source.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...source,
          isActive: !source.isActive,
        }),
      });

      if (response.ok) {
        await fetchSources();
      }
    } catch (error) {
      console.error('Failed to toggle source:', error);
    }
  };

  const resetForm = () => {
    setEditingSource(null);
    setSourceType('WEB');
    setSourceIdentifier('');
    setSourceName('');
    setIsActive(true);
  };

  const getSourceIcon = (type: string) => {
    return type === 'WEB' ? <Globe className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;
  };

  const getSourceTypeLabel = (type: string) => {
    return type === 'WEB' ? 'Website' : 'WhatsApp Group';
  };

  if (loading) {
    return <div className="p-6">Loading sources...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Digital Twin Sources</h1>
          <p className="text-muted-foreground">
            Manage sources for automatic casting call ingestion
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSource ? 'Edit Source' : 'Add New Source'}
              </DialogTitle>
              <DialogDescription>
                Configure a new data source for the Digital Twin aggregator.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="sourceType">Source Type</Label>
                <Select value={sourceType} onValueChange={(value: 'WEB' | 'WHATSAPP') => setSourceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEB">Website</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sourceName">Source Name</Label>
                <Input
                  id="sourceName"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder={sourceType === 'WEB' ? 'e.g., MBC Careers' : 'e.g., Riyadh Actors Group'}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sourceIdentifier">
                  {sourceType === 'WEB' ? 'Website URL' : 'Group Chat ID'}
                </Label>
                <Input
                  id="sourceIdentifier"
                  value={sourceIdentifier}
                  onChange={(e) => setSourceIdentifier(e.target.value)}
                  placeholder={sourceType === 'WEB' ? 'https://example.com/careers' : '120363XXX@g.us'}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {sourceType === 'WEB'
                    ? 'Full URL of the website to scrape for casting calls'
                    : 'WhatsApp Group Chat ID (format: XXXXXXXXXX@g.us)'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Active (will be processed by ingestion jobs)</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSource ? 'Update' : 'Create'} Source
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>
            {sources.length} sources configured • {sources.filter(s => s.isActive).length} active
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sources configured yet. Add your first source to start building the Digital Twin.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Last Processed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getSourceIcon(source.sourceType)}
                        <span>{getSourceTypeLabel(source.sourceType)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{source.sourceName}</TableCell>
                    <TableCell>
                      {source.sourceType === 'WEB' ? (
                        <a
                          href={source.sourceIdentifier}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          {source.sourceIdentifier}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {source.sourceIdentifier}
                        </code>
                      )}
                    </TableCell>
                    <TableCell>
                      {source.lastProcessedAt ? (
                        new Date(source.lastProcessedAt).toLocaleString()
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={source.isActive ? 'default' : 'secondary'}>
                        {source.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={source.isActive}
                          onCheckedChange={() => handleToggleActive(source)}
                          size="sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(source)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(source.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{sources.length}</div>
              <div className="text-sm text-muted-foreground">Total Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{sources.filter(s => s.isActive).length}</div>
              <div className="text-sm text-muted-foreground">Active Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{sources.filter(s => s.sourceType === 'WEB').length}</div>
              <div className="text-sm text-muted-foreground">Web Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{sources.filter(s => s.sourceType === 'WHATSAPP').length}</div>
              <div className="text-sm text-muted-foreground">WhatsApp Groups</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
