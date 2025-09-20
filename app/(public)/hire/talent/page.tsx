import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function HireTalentPage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-24 text-center">
      <Card>
        <CardContent className="items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Preview</span>
          <h1 className="text-3xl font-semibold">Verified talent directory (coming soon)</h1>
          <p className="max-w-2xl text-sm text-muted">
            Professional Access subscribers will unlock advanced filters, explainable ranking, and shortlist sharing. During the pilot, request access and our concierge team will prepare curated shortlists for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup?role=hirer"
              className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white shadow-token-sm"
            >
              Request Professional Access
            </Link>
            <Link
              href="/hirer/subscription"
              className="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-brand)]"
            >
              View plans
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
