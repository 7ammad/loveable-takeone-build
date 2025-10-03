'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, CheckCircle2, Eye, Mail } from 'lucide-react';
import Link from 'next/link';

interface Talent {
  id: string;
  name: string;
  stageName: string;
  location: string;
  age: number;
  gender: string;
  rating: number;
  experience: number;
  skills: string[];
  languages: string[];
  verified: boolean;
  profileViews: number;
  bio: string;
}

interface TalentCardProps {
  talent: Talent;
  onContact?: () => void;
}

export default function TalentCard({ talent, onContact }: TalentCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {talent.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/talent/${talent.id}`}>
              <h3 className="text-lg font-bold text-foreground truncate flex items-center gap-1 hover:text-primary transition-colors">
                {talent.stageName}
                {talent.verified && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground truncate">{talent.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{talent.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{talent.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-foreground mb-4 line-clamp-2">
          {talent.bio}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Experience</p>
            <p className="text-sm font-semibold text-foreground">{talent.experience} years</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Profile Views</p>
            <p className="text-sm font-semibold text-foreground">{talent.profileViews}</p>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Skills</p>
          <div className="flex flex-wrap gap-1">
            {talent.skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {talent.skills.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                +{talent.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Languages */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Languages</p>
          <div className="flex flex-wrap gap-1">
            {talent.languages.map((language, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-xs font-medium"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/talent/${talent.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-1" />
              View Profile
            </Button>
          </Link>
          {onContact && (
            <Button size="sm" className="flex-1" onClick={onContact}>
              <Mail className="w-4 h-4 mr-1" />
              Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

