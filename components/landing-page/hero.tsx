"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const roles = {
  talent: {
    toggleLabel: "I am Talent",
    heading: "Your professional casting home",
    subheading:
      "Create a verified profile, showcase your media, and stay in control with guardian-first privacy.",
    primaryCta: { href: "/signup?role=talent", label: "Create free profile" },
    secondaryCta: { href: "#pilot", label: "See pilot details" },
    highlights: ["Nafath-verified", "PDPL compliant", "Guardian protections"],
  },
  hirer: {
    toggleLabel: "I am a Hirer",
    heading: "Find verified talent. Fast.",
    subheading:
      "Precise filters, explainable ranking, and shareable shortlists built for Saudi productions.",
    primaryCta: { href: "/signup?role=hirer", label: "Start Professional Access" },
    secondaryCta: { href: "/hirer/subscription", label: "View plans" },
    highlights: ["Trusted by leading studios", "Concierge compliance", "Share shortlist links"],
  },
} as const;

type RoleKey = keyof typeof roles;

const kpis = [
  { label: "Verified talent", value: "1,200+" },
  { label: "Pilot shortlist rate", value: "82%" },
  { label: "Average response time", value: "6h" },
];

export function Hero() {
  const [activeRole, setActiveRole] = useState<RoleKey>("hirer");
  const role = roles[activeRole];

  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top,var(--color-brand)_0%,transparent_55%)] py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-8">
          <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-1 text-sm">
            {(Object.keys(roles) as RoleKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveRole(key)}
                className={cn(
                  "rounded-[calc(var(--radius-md)_-_2px)] px-4 py-1.5 font-medium transition",
                  activeRole === key
                    ? "bg-[var(--color-brand)] text-white shadow-token-sm"
                    : "text-muted hover:text-[var(--color-text)]",
                )}
              >
                {roles[key].toggleLabel}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">{role.heading}</h1>
            <p className="max-w-xl text-lg text-muted">{role.subheading}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={role.primaryCta.href}
              className="inline-flex items-center rounded-[var(--radius-lg)] bg-[var(--color-brand)] px-6 py-3 text-base font-semibold text-white shadow-token-sm transition hover:brightness-95"
            >
              {role.primaryCta.label}
            </Link>
            <Link
              href={role.secondaryCta.href}
              className="inline-flex items-center rounded-[var(--radius-lg)] border border-[var(--color-brand)] px-6 py-3 text-base font-semibold text-[var(--color-brand)] transition hover:bg-[var(--color-brand)]/10"
            >
              {role.secondaryCta.label}
            </Link>
          </div>

          <ul className="flex flex-wrap gap-3 text-sm text-muted">
            {role.highlights.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-elev-1)] px-3 py-1"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-brand)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-full max-w-md flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-6 shadow-token-md">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Pilot Signals
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-4">
                <p className="text-2xl font-semibold text-[var(--color-brand-600)]">{kpi.value}</p>
                <p className="text-xs text-muted">{kpi.label}</p>
              </div>
            ))}
          </div>
          <p className="rounded-[var(--radius-md)] bg-[var(--color-brand)]/10 p-4 text-sm text-[var(--color-brand-600)]">
            Founders’ rate available for the first 20 Professional Access subscribers in Riyadh and Jeddah.
          </p>
        </div>
      </div>
    </section>
  );
}
