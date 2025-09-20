"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Talent Workspace",
    items: [
      { href: "/onboarding", label: "Onboarding" },
      { href: "/talent/profile/edit", label: "Profile Editor" },
      { href: "/talent/applications", label: "Applications" },
      { href: "/talent/nafath-verification", label: "Nafath Verification" },
    ],
  },
  {
    title: "Hirer Workspace",
    items: [
      { href: "/hirer/dashboard", label: "Overview" },
      { href: "/hirer/jobs/new", label: "New Casting Call" },
      { href: "/hirer/search", label: "Talent Search" },
      { href: "/hirer/subscription", label: "Subscription" },
    ],
  },
  {
    title: "Shared",
    items: [
      { href: "/settings", label: "Account Settings" },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-8 text-sm lg:flex">
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-6 shadow-token-sm backdrop-blur">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">
            Saudi Casting Marketplace
          </span>
          <h2 className="text-xl font-semibold">Operations Hub</h2>
          <p className="text-sm text-muted">
            Manage talent, casting calls, compliance, and subscriptions in one workspace.
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {section.title}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-[var(--radius-md)] px-4 py-2 font-medium transition-colors",
                      isActive
                        ? "bg-[var(--color-brand)] text-white shadow-token-sm"
                        : "text-muted hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/10 p-4 text-sm text-[var(--color-brand-600)]">
          <p className="font-semibold">Admin Tools</p>
          <p className="mt-1 text-xs opacity-80">
            Trust & Safety teams can access moderation dashboards via the admin workspace.
          </p>
          <Link
            href="/admin"
            className="mt-3 inline-flex items-center text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-600)]"
          >
            Go to Admin Console -&gt;
          </Link>
        </div>
      </nav>
    </aside>
  );
}

