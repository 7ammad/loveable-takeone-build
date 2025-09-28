'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, ExternalLink, MessageSquare, Globe, Clock } from 'lucide-react';

interface CastingCall {
  id: string;
  title: string;
  description?: string;
  company?: string;
  location?: string;
  compensation?: string;
  requirements?: string;
  deadline?: string;
  contactInfo?: string;
  sourceUrl?: string;
  status: string;
  createdAt: string;
}

export default function DigitalTwinValidationPage() {
  const [castingCalls, setCastingCalls] = useState<CastingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CastingCall | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingCalls();
  }, []);

  const fetchPendingCalls = async () => {
    try {
      const response = await fetch('/api/admin/digital-twin/validation');
      if (response.ok) {
        const data = await response.json();
        setCastingCalls(data.calls);
      }
    } catch (error) {
      console.error('Failed to fetch pending calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (callId: string) => {
    try {
      const response = await fetch(`/api/admin/digital-twin/validation/${callId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchPendingCalls();
      }
    } catch (error) {
      console.error('Failed to approve call:', error);
    }
  };

  const handleReject = async (callId: string) => {
    try {
      const response = await fetch(`/api/admin/digital-twin/validation/${callId}/reject`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchPendingCalls();
      }
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
  };

  const getSourceIcon = (url?: string) => {
    if (!url) return <Globe className="h-4 w-4" />;
    return url.startsWith('whatsapp://') ?
      <MessageSquare className="h-4 w-4" /> :
      <Globe className="h-4 w-4" />;
  };

  const getSourceType = (url?: string) => {
    if (!url) return 'Web';
    return url.startsWith('whatsapp://') ? 'WhatsApp' : 'Web';
  };

  if (loading) {
    return <div className="p-6">Loading pending casting calls...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Validation Queue</h1>
          <p className="text-muted-foreground">
            Review and approve casting calls from the Digital Twin aggregator
          </p>
        </div>
        <Button onClick={fetchPendingCalls} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Review</CardTitle>
          <CardDescription>
            {castingCalls.length} casting calls awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {castingCalls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No casting calls pending review. The validation queue is empty!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {castingCalls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate" title={call.title}>
                        {call.title}
                      </div>
                    </TableCell>
                    <TableCell>{call.company || '-'}</TableCell>
                    <TableCell>{call.location || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getSourceIcon(call.sourceUrl)}
                        <Badge variant="outline" className="text-xs">
                          {getSourceType(call.sourceUrl)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(call.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog open={dialogOpen && selectedCall?.id === call.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (open) setSelectedCall(call);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{call.title}</DialogTitle>
                              <DialogDescription>
                                Review this casting call before approving
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              {call.description && (
                                <div>
                                  <h4 className="font-semibold mb-2">Description</h4>
                                  <p className="text-sm text-muted-foreground">{call.description}</p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Company:</span> {call.company || 'Not specified'}
                                </div>
                                <div>
                                  <span className="font-medium">Location:</span> {call.location || 'Not specified'}
                                </div>
                                <div>
                                  <span className="font-medium">Compensation:</span> {call.compensation || 'Not specified'}
                                </div>
                                <div>
                                  <span className="font-medium">Deadline:</span> {call.deadline ? new Date(call.deadline).toLocaleDateString() : 'Not specified'}
                                </div>
                              </div>

                              {call.requirements && (
                                <div>
                                  <h4 className="font-semibold mb-2">Requirements</h4>
                                  <p className="text-sm text-muted-foreground">{call.requirements}</p>
                                </div>
                              )}

                              {call.contactInfo && (
                                <div>
                                  <h4 className="font-semibold mb-2">Contact Information</h4>
                                  <p className="text-sm text-muted-foreground">{call.contactInfo}</p>
                                </div>
                              )}

                              {call.sourceUrl && (
                                <div>
                                  <h4 className="font-semibold mb-2">Source</h4>
                                  <a
                                    href={call.sourceUrl.startsWith('whatsapp://') ? '#' : call.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center"
                                  >
                                    {call.sourceUrl}
                                    {!call.sourceUrl.startsWith('whatsapp://') && <ExternalLink className="h-3 w-3 ml-1" />}
                                  </a>
                                </div>
                              )}

                              <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => handleReject(call.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button onClick={() => handleApprove(call.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(call.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(call.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-3 w-3" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{castingCalls.length}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {castingCalls.filter(c => c.sourceUrl?.startsWith('whatsapp://')).length}
              </div>
              <div className="text-sm text-muted-foreground">From WhatsApp</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {castingCalls.filter(c => !c.sourceUrl?.startsWith('whatsapp://')).length}
              </div>
              <div className="text-sm text-muted-foreground">From Web</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
