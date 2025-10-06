'use client';

import React from 'react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-primary/5">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
          Find Your Next
          <br />
          <span className="text-primary">Casting Call</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-[800px] mx-auto leading-relaxed">
          Stop searching through endless DMs and social media posts. TakeOne brings every active casting call in Saudi Arabia to one organized platform.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/casting-calls" className="px-8 py-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg">
            Browse Casting Calls
          </Link>
          <Link href="#how-it-works" className="px-8 py-4 rounded-md border border-foreground text-foreground hover:border-primary hover:text-primary font-bold text-lg">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
