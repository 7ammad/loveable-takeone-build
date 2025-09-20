import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100/70 py-10 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 lg:flex-row lg:px-8">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col gap-6">
          <DashboardHeader />
          <main className="flex-1">
            <div className="flex flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
