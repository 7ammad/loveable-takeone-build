import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[520px_minmax(0,1fr)]">
      <div className="flex flex-col border-b border-[var(--color-border)] bg-[var(--color-elev-1)] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-600)]">
            Saudi Casting Marketplace
          </Link>
          <Link href="/signup" className="text-xs font-semibold text-muted hover:text-[var(--color-text)]">
            Join
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-10">
          <LoginForm />
        </div>
        <div className="px-6 py-6 text-xs text-muted">
          Need help with onboarding or Nafath verification? Email
          <a href="mailto:concierge@scm.sa" className="ml-1 font-semibold text-[var(--color-brand)]">
            concierge@scm.sa
          </a>
          .
        </div>
      </div>

      <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_top,var(--color-brand)_0%,#051414_70%)] px-12 py-16 text-white lg:flex">
        <div className="space-y-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Secure workspace</span>
          <h2 className="text-3xl font-semibold leading-tight">Your professional casting control center</h2>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-white" />
              99.9% uptime with PDPL-aligned access controls.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-white" />
              Guardian protections and verification gates enforced platform-wide.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-white" />
              Concise audit trails for compliance and moderation teams.
            </li>
          </ul>
        </div>

        <div className="rounded-[var(--radius-lg)] bg-white/10 p-6 backdrop-blur">
          <p className="text-sm italic text-white/90">“We consolidated casting, compliance, and messaging in a single view. The concierge team keeps us production-ready.”</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-white">
            Pilot Casting Lead
            <span className="block text-[11px] font-normal text-white/70">Saudi Media Group</span>
          </p>
        </div>

        <div className="text-[11px] text-white/60">
          Professional Access • Concierge onboarding • Trust & Safety monitoring
        </div>
      </div>
    </div>
  );
}
