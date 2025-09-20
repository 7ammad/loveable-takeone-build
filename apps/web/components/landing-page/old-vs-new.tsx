const oldPainPoints = [
  "Chaotic WhatsApp threads",
  "Unsecure files and lost media",
  "No visibility on status or compliance",
];

const newBenefits = [
  "Nafath-verified talent in one workspace",
  "Structured pipeline with explainable ranking",
  "Concierge compliance and guardian protections",
];

export function OldVsNew() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-8 shadow-token-sm">
          <h3 className="text-xl font-semibold">Old way</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {oldPainPoints.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/10 p-8 shadow-token-sm">
          <h3 className="text-xl font-semibold text-[var(--color-brand-600)]">New way</h3>
          <ul className="mt-4 space-y-3 text-sm text-[var(--color-brand-600)]">
            {newBenefits.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[var(--color-brand)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
