'use client';

import { LandingHeader } from '@/components/Header';
import Hero from '@/components/Hero';
import LogoMarquee from '@/components/LogoMarquee';
import CastingOpportunities from '@/components/CastingOpportunities';
import TalentGrid from '@/components/TalentGrid';
import ProcessSection from '@/components/ProcessSection';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import AdvantageSection from '@/components/AdvantageSection';

export default function HomePage() {
  return (
    <div>
      <LandingHeader />
      <main>
        <Hero />
        <LogoMarquee />
        <TalentGrid />
        <CastingOpportunities />
        <ProcessSection />
        <AdvantageSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
