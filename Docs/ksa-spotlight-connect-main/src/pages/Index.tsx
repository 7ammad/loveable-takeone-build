import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LogoMarquee from "@/components/LogoMarquee";
import ProcessSection from "@/components/ProcessSection";
import TalentGrid from "@/components/TalentGrid";
import CastingOpportunities from "@/components/CastingOpportunities";
import AdvantageSection from "@/components/AdvantageSection";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background snap-y snap-mandatory overflow-y-scroll h-screen">
      <Header />
      <div className="snap-start">
        <Hero />
      </div>
      <div className="snap-start">
        <LogoMarquee />
      </div>
      <div className="snap-start">
        <ProcessSection />
      </div>
      <div className="snap-start">
        <TalentGrid />
      </div>
      <div className="snap-start">
        <CastingOpportunities />
      </div>
      <div className="snap-start">
        <AdvantageSection />
      </div>
      <div className="snap-start">
        <Testimonials />
      </div>
      <div className="snap-start">
        <FinalCTA />
      </div>
      <div className="snap-start">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
