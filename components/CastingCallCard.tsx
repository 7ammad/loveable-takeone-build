'use client';

import React from 'react';

interface CastingCallCardProps {
  projectTitle: string;
  role: string;
  city: string;
  company?: string;
  deadline?: string;
}

export function CastingCallCard({ 
  projectTitle, 
  role, 
  city, 
  company,
  deadline 
}: CastingCallCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(255,68,170,0.1)] hover:border-primary/50">
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2">
          {projectTitle}
        </h3>
        
        <p className="text-primary font-medium mb-4">
          {role}
        </p>

        {company && (
          <p className="text-sm text-muted-foreground mb-4">
            {company}
          </p>
        )}

        <div className="flex items-center mb-4">
          <span className="text-primary mr-2">📍</span>
          <span className="text-sm text-muted-foreground">{city}</span>
        </div>

        {deadline && (
          <span className="inline-block px-3 py-1 rounded-md text-xs bg-primary/10 text-primary border border-primary/30">
            Deadline: {deadline}
          </span>
        )}
      </div>

      <div className="px-6 pb-6">
        <button className="w-full py-2 rounded-md border border-foreground text-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
