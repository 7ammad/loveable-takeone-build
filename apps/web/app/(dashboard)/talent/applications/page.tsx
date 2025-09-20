import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentTalentProfile } from "@/lib/auth";
import { getTalentApplicationSummary, getRoleById, getCastingCallById, listSavedSearchesByUser } from "@/lib/db";
import { formatDate, classForStatus, computeProfileHealth } from "@/lib/utils";
import { SavedSearchesPanel } from "@/components/dashboard/saved-searches";
import Link from "next/link";

export default async function TalentApplicationsPage() {
  const profile = await getCurrentTalentProfile();

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted">No profile found. Create a profile before tracking applications.</p>
        </CardContent>
      </Card>
    );
  }

  const summary = getTalentApplicationSummary(profile.id);
  const applications = summary?.applications ?? [];
  const savedSearches = listSavedSearchesByUser(profile.userId);
  const health = computeProfileHealth(profile);

  return (
    <div className="space-y-6">
      {health.status !== "ready" && (
        <Card className="border-[var(--color-brand)]/30 bg-[var(--color-brand)]/10">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-brand-600)]">
            <div>
              <p className="font-semibold">Finish onboarding to unlock priority invites</p>
              <p className="text-xs">
                Complete the remaining checklist steps to boost your profile health and reach pilot shortlists faster.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-brand)] px-4 py-2 text-xs font-semibold"
            >
              Open onboarding checklist
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Applications overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-elev-1)] p-4 shadow-token-sm">
              <p className="text-xs uppercase tracking-wide text-muted">Active applications</p>
              <p className="mt-2 text-2xl font-semibold">{applications.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-elev-1)] p-4 shadow-token-sm">
              <p className="text-xs uppercase tracking-wide text-muted">Shortlisted</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-brand-600)]">
                {applications.filter((app) => app.status === "SHORTLISTED").length}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-elev-1)] p-4 shadow-token-sm">
              <p className="text-xs uppercase tracking-wide text-muted">Awaiting response</p>
              <p className="mt-2 text-2xl font-semibold">
                {applications.filter((app) => app.status === "APPLIED").length}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Casting call</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => {
                const role = getRoleById(application.roleId);
                const castingCall = role ? getCastingCallById(role.castingCallId) : undefined;
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-[var(--color-text)]">{castingCall?.title ?? "Casting"}</span>
                        <span className="text-xs text-muted">{castingCall?.project}</span>
                      </div>
                    </TableCell>
                    <TableCell>{role?.title}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classForStatus(application.status)}`}>
                        {application.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted">{formatDate(application.updatedAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SavedSearchesPanel initialSearches={savedSearches} userId={profile.userId} />
    </div>
  );
}
