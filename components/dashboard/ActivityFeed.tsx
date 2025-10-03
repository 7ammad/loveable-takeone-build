'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'application_update' | 'message' | 'profile_view' | 'casting_call' | 'system';
  icon: LucideIcon;
  iconColor: string;
  title: string;
  timestamp: string;
  actionLink?: string;
  actionLabel?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
}

export default function ActivityFeed({ activities, title = 'Recent Activity' }: ActivityFeedProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.iconColor} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                </div>
                {activity.actionLink && activity.actionLabel && (
                  <Link href={activity.actionLink}>
                    <Button variant="ghost" size="sm">
                      {activity.actionLabel}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

