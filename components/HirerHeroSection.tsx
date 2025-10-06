'use client';

import React from 'react';

export function HirerHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background/95 z-10" />
      </div>

      <div className="relative z-20 container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.05] tracking-tight">
          Find Your Next
          <br />
          <span className="text-primary">Perfect Cast</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          Stop posting casting calls across multiple platforms. TakeOne brings you access to Saudi Arabia&apos;s most talented actors, models, and performers in one organized platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a className="px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" href="#">
            Post Your Casting Call
          </a>
          <a className="px-8 py-4 rounded-lg border border-secondary text-secondary hover:bg-secondary hover:text-foreground font-semibold" href="#discover">
            Browse Talent
          </a>
        </div>
      </div>
    </section>
  );
}
