const partners = [
  "MBC Studios",
  "Telfaz11",
  "Nebras",
  "Film Commission",
];

const counters = [
  { label: "Shortlist time reduction", value: "40%" },
  { label: "Verified applications within 72h", value: "5+" },
  { label: "Pilot NPS target", value: "60" },
];

export function SocialProof() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-sm space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Trusted pilot partners
          </p>
          <p className="text-sm text-muted">
            Built alongside Saudi producers, casting directors, and guardians to replace ad-hoc messaging with a regulated workflow.
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {partners.map((partner) => (
              <div
                key={partner}
                className="flex h-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-elev-1)] px-4 text-sm font-semibold text-muted shadow-token-sm"
              >
                {partner}
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {counters.map((counter) => (
              <div key={counter.label} className="rounded-[var(--radius-md)] bg-[var(--color-elev-1)] p-4 text-center shadow-token-sm">
                <p className="text-2xl font-semibold text-[var(--color-brand-600)]">{counter.value}</p>
                <p className="text-xs text-muted uppercase tracking-wide">{counter.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
