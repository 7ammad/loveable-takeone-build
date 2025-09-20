import Link from "next/link";

export function PilotCTA() {
  return (
    <section
      id="pilot"
      className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/10 px-10 py-16 text-center shadow-token-md"
    >
      <h2 className="text-3xl font-semibold text-[var(--color-brand-600)]">
        Join the 8-week pilot and help define Phase B
      </h2>
      <p className="max-w-2xl text-base text-[var(--color-brand-600)]/90">
        Limited seats for professional casting teams in Riyadh and Jeddah. Founders’ rate, concierge onboarding, and full trust-and-safety coverage from day one.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/signup?role=hirer"
          className="inline-flex items-center rounded-[var(--radius-lg)] bg-[var(--color-brand)] px-6 py-3 text-base font-semibold text-white shadow-token-sm transition hover:brightness-95"
        >
          Secure pilot seat
        </Link>
        <Link
          href="/signup?role=talent"
          className="inline-flex items-center rounded-[var(--radius-lg)] border border-[var(--color-brand)] px-6 py-3 text-base font-semibold text-[var(--color-brand)] transition hover:bg-[var(--color-brand)]/10"
        >
          Prepare talent profile →
        </Link>
      </div>
      <p className="text-xs uppercase tracking-wide text-[var(--color-brand-600)]/80">
        Pilot window: 8 weeks · Riyadh · Jeddah
      </p>
    </section>
  );
}
