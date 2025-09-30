'use client';

import { Header } from '@/components/Header';
import { HirerHeroSection } from '@/components/HirerHeroSection';
import { TrustBar } from '@/components/TrustBar';
import { LivePlatformFeed } from '@/components/LivePlatformFeed';
import { HirerValuePropositions } from '@/components/HirerValuePropositions';
import { HirerHowItWorks } from '@/components/HirerHowItWorks';
import { HirerTestimonials } from '@/components/HirerTestimonials';
import { HirerFinalCTA } from '@/components/HirerFinalCTA';
import { Footer } from '@/components/Footer';

export default function CastersPage() {
  return (
    <div>
      <Header />
      <main>
        <HirerHeroSection />
        <TrustBar />
        <LivePlatformFeed />
        <HirerValuePropositions />
        <HirerHowItWorks />
        <HirerTestimonials />
        <HirerFinalCTA />
      </main>
      <Footer />
    </div>
  );
}
