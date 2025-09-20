import type { ReactNode } from "react";
import Link from "next/link";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/compliance", label: "Compliance" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Admin Console
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {adminNav.map((item) => (
              <Link key={item.href} href={item.href} className="text-slate-400 hover:text-emerald-200">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
