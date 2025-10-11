'use client';

/**
 * Admin Dashboard - Overview and Navigation
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Instagram,
  Globe,
  AlertCircle,
  Play,
  Pause,
  DollarSign,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface DigitalTwinStatus {
  isRunning: boolean;
  sources: {
    total: number;
    active: number;
    instagram: number;
    web: number;
  };
  calls: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  recentActivity: Array<{
    id: string;
    sourceName: string;
    sourceType: string;
    lastProcessedAt: string | null;
  }>;
  lastRunTime: string | null;
  nextRunTime: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [status, setStatus] = useState<DigitalTwinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<{ data: DigitalTwinStatus }>(
        '/api/v1/admin/digital-twin/status'
      );
      setStatus(data.data);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 403) {
        setError('Admin access required');
      } else {
        setError('Failed to fetch status');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Digital Twin & Casting Call Management</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/validation-queue">
              <Clock className="w-4 h-4 mr-2" />
              Validation Queue ({status?.calls.pending || 0})
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/usage-metrics">
              <DollarSign className="w-4 h-4 mr-2" />
              Usage & Costs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/sources">Manage Sources</Link>
          </Button>
        </div>
      </div>

      {/* Digital Twin Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Digital Twin Status
            {status?.isRunning ? (
              <Badge className="bg-green-500">
                <Play className="w-3 h-3 mr-1" />
                Running
              </Badge>
            ) : (
              <Badge variant="destructive">
                <Pause className="w-3 h-3 mr-1" />
                Stopped
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {status?.lastRunTime 
              ? `Last run: ${new Date(status.lastRunTime).toLocaleString()}`
              : 'Never run'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Sources</CardDescription>
            <CardTitle className="text-3xl">{status?.sources.active || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Instagram className="w-4 h-4" />
                {status?.sources.instagram || 0} IG
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {status?.sources.web || 0} Web
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {status?.calls.pending || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/admin/validation-queue')}
            >
              Review Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved Calls</CardDescription>
            <CardTitle className="text-3xl text-green-600 flex items-center gap-2">
              {status?.calls.approved || 0}
              <CheckCircle className="w-6 h-6" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected Calls</CardDescription>
            <CardTitle className="text-3xl text-red-600 flex items-center gap-2">
              {status?.calls.rejected || 0}
              <XCircle className="w-6 h-6" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scraping Activity</CardTitle>
          <CardDescription>Last processed sources</CardDescription>
        </CardHeader>
        <CardContent>
          {status?.recentActivity && status.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {status.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {activity.sourceType === 'INSTAGRAM' ? (
                      <Instagram className="w-5 h-5 text-pink-600" />
                    ) : (
                      <Globe className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="font-medium">{activity.sourceName}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {activity.lastProcessedAt
                      ? new Date(activity.lastProcessedAt).toLocaleString()
                      : 'Not processed yet'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/admin/validation-queue">
                <div className="flex flex-col items-center gap-2">
                  <Clock className="w-6 h-6" />
                  <span>Review Queue</span>
                  {status?.calls.pending ? (
                    <Badge className="bg-orange-500">{status.calls.pending}</Badge>
                  ) : null}
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/admin/usage-metrics">
                <div className="flex flex-col items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  <span>Usage & Costs</span>
                  <Badge variant="outline">SAR</Badge>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/admin/sources">
                <div className="flex flex-col items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  <span>WhatsApp Groups</span>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/casting-calls">
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>View Live Calls</span>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

