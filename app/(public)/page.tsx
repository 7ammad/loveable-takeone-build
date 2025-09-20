import { Hero } from "@/components/landing-page/hero";
import { SocialProof } from "@/components/landing-page/social-proof";
import { OldVsNew } from "@/components/landing-page/old-vs-new";
import { FeatureGrid } from "@/components/landing-page/feature-grid";
import { PilotCTA } from "@/components/landing-page/pilot-cta";
import { Card, CardContent } from "@/components/ui/card";

const successMetrics = [
  { label: "Verified applications within 72h", target: "5+" },
  { label: "Paying hirer subscribers in pilot", target: "20" },
  { label: "Net promoter score target", target: "60" },
  { label: "Guardian consent compliance", target: "100%" },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <SocialProof />
      <OldVsNew />
      <FeatureGrid />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="gap-4">
              <h3 className="text-xl font-semibold">Strategic pillars</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>• High-trust talent discovery with Nafath verification.</li>
                <li>• Guardian-as-primary-user model for minors.</li>
                <li>• Professional Access subscription for hirers.</li>
                <li>• Concierge compliance workflows for sensitive shoots.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="gap-4">
              <h3 className="text-xl font-semibold">Pilot success metrics</h3>
              <ul className="space-y-3 text-sm text-muted">
                {successMetrics.map((metric) => (
                  <li key={metric.label} className="flex items-center justify-between gap-4">
                    <span>{metric.label}</span>
                    <span className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-brand-600)]">
                      {metric.target}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="px-6 pb-24">
        <PilotCTA />
      </div>
    </main>
  );
}
