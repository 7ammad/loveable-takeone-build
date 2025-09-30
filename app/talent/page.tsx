'use client';

import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { TrustBar } from '@/components/TrustBar';
import { LivePlatformFeed } from '@/components/LivePlatformFeed';
import { ValuePropositions } from '@/components/ValuePropositions';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';

export default function TalentPage() {
  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <TrustBar />
        <LivePlatformFeed />
        <ValuePropositions />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
