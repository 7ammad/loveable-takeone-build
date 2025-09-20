"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const labelOverrides: Record<string, string> = {
  "/talent/profile/edit": "Profile Editor",
  "/talent/applications": "Applications",
  "/talent/nafath-verification": "Nafath Verification",
  "/hirer/dashboard": "Hirer Overview",
  "/hirer/jobs/new": "Create Casting Call",
  "/hirer/search": "Talent Search",
  "/hirer/subscription": "Subscription",
  "/settings": "Account Settings",
};

function titleFromPath(pathname: string): string {
  if (labelOverrides[pathname]) {
    return labelOverrides[pathname];
  }

  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) {
    return "Dashboard";
  }
  return segments
    .slice(-1)[0]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const buttonBase =
  "inline-flex h-9 items-center rounded-[var(--radius-md)] px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2";

export function DashboardHeader() {
  const pathname = usePathname();
  const title = useMemo(() => titleFromPath(pathname ?? "/"), [pathname]);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elev-1)] px-6 py-4 shadow-token-sm backdrop-blur">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-muted">Operations Workspace</span>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/talent/nafath-verification"
          className={cn(
            buttonBase,
            "border border-[var(--color-border)] bg-[var(--color-elev-1)] text-muted hover:bg-[var(--color-surface)] focus-visible:ring-[var(--color-brand)]",
          )}
        >
          Verify with Nafath
        </Link>
        <Link
          href="/hirer/jobs/new"
          className={cn(
            buttonBase,
            "bg-[var(--color-brand)] text-white shadow-token-sm hover:brightness-95 focus-visible:ring-[var(--color-brand)]",
          )}
        >
          Post Casting Call
        </Link>
        <Avatar name="Riyadh Media" className="h-9 w-9" />
      </div>
    </header>
  );
}

