import type { ReactNode } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/hire/talent", label: "Find Talent" },
  { href: "/jobs", label: "Find a Job" },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-elev-1)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-600)]">
            Saudi Casting Marketplace
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[var(--color-text)]">
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="hover:text-[var(--color-text)]">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-brand)] px-3 py-1.5 font-semibold text-[var(--color-brand)] hover:bg-[var(--color-brand)]/10"
            >
              Join
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-muted">
          <span>© {new Date().getFullYear()} Saudi Casting Marketplace</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="mailto:trust@scm.sa">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
