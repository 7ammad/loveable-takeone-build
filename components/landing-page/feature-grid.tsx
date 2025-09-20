const features = [
  {
    title: "Verified marketplace",
    description:
      "Nafath identity, PDPL-grade data handling, and guardian-first privacy keep every interaction compliant.",
    bulletPoints: [
      "Verification badges with freshness indicators",
      "Guardian-managed minor profiles",
      "Audit-ready consent and purpose tracking",
    ],
  },
  {
    title: "Pro casting workflow",
    description:
      "Structured roles, kanban pipeline, and Kanban-to-share shortlist links built for busy casting teams.",
    bulletPoints: [
      "Explainable search and invites",
      "Concierge compliance desk",
      "Real-time applicant activity feed",
    ],
  },
  {
    title: "Media & compliance",
    description:
      "Watermarked self-tapes, moderation queue, and exportable compliance packs in a single workspace.",
    bulletPoints: [
      "Secure uploads with watermarking",
      "Moderation actions logged to AuditEvent",
      "PDF/JSON compliance pack exports",
    ],
  },
];

export function FeatureGrid() {
  return (
    <section className="bg-[var(--color-surface)] py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-8 shadow-token-sm"
          >
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="mt-3 text-sm text-muted">{feature.description}</p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              {feature.bulletPoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[var(--color-brand)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
