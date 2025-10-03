'use client';

import TalentCard from './TalentCard';

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

interface TalentGridProps {
  talents: Talent[];
  onContactTalent?: (talentId: string) => void;
  isLoading?: boolean;
}

export default function TalentGrid({ talents, onContactTalent, isLoading }: TalentGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted rounded-lg h-96" />
          </div>
        ))}
      </div>
    );
  }

  if (talents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No talent found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {talents.map((talent) => (
        <TalentCard 
          key={talent.id} 
          talent={talent}
          onContact={onContactTalent ? () => onContactTalent(talent.id) : undefined}
        />
      ))}
    </div>
  );
}

