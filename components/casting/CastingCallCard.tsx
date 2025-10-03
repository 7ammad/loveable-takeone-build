'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface CastingCall {
  id: string;
  title: string;
  description?: string;
  company?: string;
  location?: string;
  compensation?: string;
  requirements?: string;
  deadline?: string;
  status: string;
  isAggregated: boolean;
  views: number;
  createdAt: string;
}

interface CastingCallCardProps {
  castingCall: CastingCall;
  onApply?: () => void;
}

export default function CastingCallCard({ castingCall, onApply }: CastingCallCardProps) {
  const daysLeft = castingCall.deadline 
    ? Math.ceil((new Date(castingCall.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Status indicator */}
      <div className={`h-1 ${castingCall.isAggregated ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-green-500'}`} />
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex-1">
            <Link href={`/casting-calls/${castingCall.id}`}>
              <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-1">
                {castingCall.title}
              </h3>
            </Link>
            {castingCall.company && (
              <p className="text-sm text-muted-foreground">{castingCall.company}</p>
            )}
          </div>
          
          {!castingCall.isAggregated && (
            <div className="flex-shrink-0 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified</span>
            </div>
          )}
        </div>
        
        {/* Key details */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          {castingCall.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{castingCall.location}</span>
            </div>
          )}
          
          {daysLeft !== null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span className={daysLeft <= 3 ? 'text-orange-600 font-medium' : ''}>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
              </span>
            </div>
          )}
          
          {castingCall.compensation && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>{castingCall.compensation}</span>
            </div>
          )}
        </div>
        
        {/* Description */}
        {castingCall.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {castingCall.description}
          </p>
        )}
        
        {/* Requirements */}
        {castingCall.requirements && (
          <div className="pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-1">Requirements</p>
            <p className="text-sm text-foreground line-clamp-2">
              {castingCall.requirements}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex gap-2">
        <Link href={`/casting-calls/${castingCall.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        {onApply && (
          <Button onClick={onApply} className="flex-1">
            Apply Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

