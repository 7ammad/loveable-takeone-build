'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Video, Phone, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
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
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';

interface Booking {
  id: string;
  scheduledAt: string;
  duration: number;
  timezone: string;
  meetingType: string;
  location?: string;
  meetingUrl?: string;
  status: string;
  casterNotes?: string;
  talentNotes?: string;
  application: {
    id: string;
    status: string;
  };
  talent: {
    id: string;
    name: string;
    avatar?: string;
  };
  caster: {
    id: string;
    name: string;
    avatar?: string;
  };
  castingCall: {
    id: string;
    title: string;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'talent' | 'caster' | null>(null);

  useEffect(() => {
    fetchUserRole();
    fetchBookings();
  }, [selectedTab]);

  async function fetchUserRole() {
    try {
      const response = await apiClient.get<{ success: boolean; data: { role: 'talent' | 'caster' } }>('/api/v1/profiles/me');
      if (response.data.success) {
        setUserRole(response.data.data.role);
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    }
  }

  async function fetchBookings() {
    setLoading(true);
    try {
      const statusFilter = selectedTab === 'upcoming' ? 'scheduled,confirmed' : selectedTab === 'completed' ? 'completed' : 'cancelled';
      const response = await apiClient.get<{ success: boolean; data: Booking[] }>(`/api/v1/bookings?status=${statusFilter}`);
      
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(bookingId: string) {
    try {
      const response = await apiClient.patch<{ success: boolean }>(`/api/v1/bookings/${bookingId}`, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by user',
      });

      if (response.data.success) {
        alert('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      scheduled: { label: 'Scheduled', variant: 'default' },
      confirmed: { label: 'Confirmed', variant: 'default' },
      cancelled: { label: 'Cancelled', variant: 'destructive' },
      completed: { label: 'Completed', variant: 'secondary' },
      'no-show': { label: 'No Show', variant: 'outline' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  function getMeetingIcon(meetingType: string) {
    switch (meetingType) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function isUpcoming(dateString: string) {
    return new Date(dateString) > new Date();
  }

  const filteredBookings = bookings.filter((booking) => {
    if (selectedTab === 'upcoming') {
      return isUpcoming(booking.scheduledAt) && ['scheduled', 'confirmed'].includes(booking.status);
    } else if (selectedTab === 'completed') {
      return booking.status === 'completed';
    } else if (selectedTab === 'cancelled') {
      return booking.status === 'cancelled';
    }
    return true;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Audition Bookings</h1>
            <p className="text-muted-foreground">
              Manage your scheduled auditions and view booking history
            </p>
          </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="upcoming">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            <XCircle className="w-4 h-4 mr-2" />
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground text-center">
                  {selectedTab === 'upcoming' && "You don't have any upcoming auditions scheduled."}
                  {selectedTab === 'completed' && "You don't have any completed auditions yet."}
                  {selectedTab === 'cancelled' && "You don't have any cancelled auditions."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{booking.castingCall.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          {userRole === 'caster' ? `with ${booking.talent.name}` : `with ${booking.caster.name}`}
                        </CardDescription>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Date & Time */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{formatDate(booking.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatTime(booking.scheduledAt)} ({booking.duration} min)</span>
                      </div>
                    </div>

                    {/* Meeting Type & Location */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        {getMeetingIcon(booking.meetingType)}
                        <span className="capitalize">{booking.meetingType.replace('-', ' ')}</span>
                      </div>
                      {booking.meetingType === 'video' && booking.meetingUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(booking.meetingUrl, '_blank')}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Meeting
                        </Button>
                      )}
                      {booking.meetingType === 'in-person' && booking.location && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="break-words">{booking.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {userRole === 'caster' && booking.casterNotes && (
                      <div className="text-sm p-3 bg-muted rounded-lg">
                        <p className="font-medium mb-1">Your Notes:</p>
                        <p className="text-muted-foreground">{booking.casterNotes}</p>
                      </div>
                    )}
                    {userRole === 'talent' && booking.talentNotes && (
                      <div className="text-sm p-3 bg-muted rounded-lg">
                        <p className="font-medium mb-1">Your Notes:</p>
                        <p className="text-muted-foreground">{booking.talentNotes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {selectedTab === 'upcoming' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(`https://cal.com/reschedule/${booking.id}`, '_blank')}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => setCancellingId(booking.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Audition Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this audition? This action cannot be undone and both parties will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancellingId && handleCancelBooking(cancellingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </div>
    </ProtectedRoute>
  );
}
