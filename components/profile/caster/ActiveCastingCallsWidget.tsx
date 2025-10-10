'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Briefcase, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';

interface CastingCall {
  id: string;
  title: string;
  location?: string;
  deadline?: string;
  status: string;
  projectType?: string;
  createdAt: string;
}

interface ActiveCastingCallsWidgetProps {
  userId: string;
  isOwnProfile?: boolean;
}

export default function ActiveCastingCallsWidget({ userId, isOwnProfile = false }: ActiveCastingCallsWidgetProps) {
  const [castingCalls, setCastingCalls] = useState<CastingCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCastingCalls() {
      try {
        const response = await apiClient.get<{
          success: boolean;
          data: { castingCalls: CastingCall[] };
        }>(`/api/v1/casting-calls?createdBy=${userId}&status=published`);
        
        if (response.data.success) {
          setCastingCalls(response.data.data.castingCalls);
        }
      } catch (error) {
        console.error('Failed to fetch casting calls:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCastingCalls();
  }, [userId]);

  const getDaysAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Active Casting Calls
          </CardTitle>
          {isOwnProfile && (
            <Link href="/casting-calls/create">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Call
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : castingCalls.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {isOwnProfile ? 'No active casting calls yet. Create one to get started!' : 'No active casting calls at the moment.'}
            </p>
            {isOwnProfile && (
              <Link href="/casting-calls/create">
                <Button variant="outline" size="sm" className="mt-4">
                  Create Your First Call
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {castingCalls.slice(0, 5).map((call) => (
              <Link 
                key={call.id} 
                href={`/casting-calls/${call.id}`}
                className="block p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate mb-1">
                      {call.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {call.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{call.location}</span>
                        </div>
                      )}
                      {call.projectType && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          {call.projectType}
                        </Badge>
                      )}
                      <span>Posted {getDaysAgo(call.createdAt)}</span>
                    </div>
                    
                    {call.deadline && (
                      <div className="flex items-center gap-1 text-xs mt-2">
                        <Calendar className="w-3 h-3 text-orange-500" />
                        <span className="text-orange-600 font-medium">
                          {getDaysUntilDeadline(call.deadline)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
            
            {castingCalls.length > 5 && (
              <div className="p-4 text-center">
                <Link href={isOwnProfile ? '/casting-calls/manage' : `/casting-calls?caster=${userId}`}>
                  <Button variant="ghost" size="sm">
                    View All {castingCalls.length} Casting Calls
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

