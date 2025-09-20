import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function JobsPage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-24 text-center">
      <Card>
        <CardContent className="items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Preview</span>
          <h1 className="text-3xl font-semibold">Job board (coming soon)</h1>
          <p className="max-w-2xl text-sm text-muted">
            Talent and guardians will soon be able to save searches, receive alerts, and apply with verified profiles. Until then, complete your profile and the concierge team will notify you when matching roles open.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup?role=talent"
              className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white shadow-token-sm"
            >
              Create profile
            </Link>
            <Link
              href="/talent/nafath-verification"
              className="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-brand)]"
            >
              Complete Nafath
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
