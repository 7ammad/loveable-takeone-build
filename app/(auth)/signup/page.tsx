"use client";

import Link from "next/link";
import { useState } from "react";
import { SignupForm } from "@/components/auth/signup-form";
import type { UserRole } from "@/lib/definitions";

type SignupRole = Extract<UserRole, "TALENT" | "GUARDIAN" | "HIRER">;

const conversionCopy: Record<
  SignupRole,
  {
    headline: string;
    bullets: string[];
    testimonial: { quote: string; name: string; role: string };
  }
> = {
  TALENT: {
    headline: "Verified profiles with guardian-first privacy",
    bullets: [
      "Nafath identity required before applications",
      "Headshots, reels, and credits in one dossier",
      "Saved searches and alerts coming for the pilot",
    ],
    testimonial: {
      quote: "Casting finally feels organised. Shortlists, compliance, and guardian approvals all in one place.",
      name: "Mariam Al-Harthi",
      role: "Executive Producer, Pilot Partner",
    },
  },
  GUARDIAN: {
    headline: "Manage minors end-to-end",
    bullets: [
      "Create and control multiple sub-profiles",
      "Approve every application and message",
      "Concierge support for compliance documents",
    ],
    testimonial: {
      quote: "Guardians stay in control from verification to compliance—no more ad-hoc email chains.",
      name: "Hala Al Rashid",
      role: "Guardian, Pilot Program",
    },
  },
  HIRER: {
    headline: "Professional Access for trusted shortlists",
    bullets: [
      "Explainable search with hard constraints first",
      "Kanban pipeline and shareable shortlist links",
      "Concierge compliance pack for every casting call",
    ],
    testimonial: {
      quote: "We replaced chaotic messaging with a verifiable workflow and compliance logging in days.",
      name: "Riyadh Media Casting",
      role: "Pilot Casting Lead",
    },
  },
};

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<SignupRole>("HIRER");
  const copy = conversionCopy[selectedRole];

  function handleRoleChange(role: UserRole) {
    if (role === "ADMIN") return;
    setSelectedRole(role as SignupRole);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[520px_minmax(0,1fr)]">
      <div className="flex flex-col border-b border-[var(--color-border)] bg-[var(--color-elev-1)] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-600)]">
            Saudi Casting Marketplace
          </Link>
          <Link href="/login" className="text-xs font-semibold text-muted hover:text-[var(--color-text)]">
            Sign in
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-10">
          <SignupForm onRoleChange={handleRoleChange} />
        </div>
        <div className="px-6 py-6 text-xs text-muted">
          Need assistance? Email
          <a href="mailto:concierge@scm.sa" className="ml-1 font-semibold text-[var(--color-brand)]">
            concierge@scm.sa
          </a>
          .
        </div>
      </div>

      <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_top,var(--color-brand)_0%,#051414_70%)] px-12 py-16 text-white lg:flex">
        <div className="space-y-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Why join the pilot</span>
          <h2 className="text-3xl font-semibold leading-tight">{copy.headline}</h2>
          <ul className="space-y-3 text-sm text-white/80">
            {copy.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-white" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[var(--radius-lg)] bg-white/10 p-6 backdrop-blur">
          <p className="text-sm italic text-white/90">“{copy.testimonial.quote}”</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-white">
            {copy.testimonial.name}
            <span className="block text-[11px] font-normal text-white/70">{copy.testimonial.role}</span>
          </p>
        </div>

        <div className="text-[11px] text-white/60">
          © {new Date().getFullYear()} Saudi Casting Marketplace · PDPL aligned · Guardian-as-primary-user compliant
        </div>
      </div>
    </div>
  );
}
