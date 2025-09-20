import { MetricGrid } from "@/components/dashboard/metric-grid";
import { KanbanBoard } from "@/components/hirer/kanban/kanban-board";
import { ShareLinkPanel } from "@/components/hirer/share-link-panel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  buildKanbanColumns,
  getHirerDashboardData,
  listMessageThreadsByHirer,
  listCastingCallsByHirer,
  listRolesByCastingCall,
  listShareLinksByUser,
} from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

export default async function HirerDashboardPage() {
  const hirer = await getCurrentUser("HIRER");
  if (!hirer) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted">No hirer account detected for this session.</p>
        </CardContent>
      </Card>
    );
  }

  const overview = getHirerDashboardData(hirer.id);
  const castingCalls = listCastingCallsByHirer(hirer.id);
  const firstCall = castingCalls[0];
  const kanbanColumns = firstCall ? buildKanbanColumns(firstCall.id) : [];
  const threads = listMessageThreadsByHirer(hirer.id);
  const shareLinks = listShareLinksByUser(hirer.id);

  return (
    <div className="space-y-6">
      <MetricGrid metrics={overview.metrics} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent casting calls</CardTitle>
            <CardDescription>Drafts move to OPEN when required roles are added.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {castingCalls.map((call) => (
              <div
                key={call.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-elev-1)] p-4 shadow-token-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">{call.title}</h3>
                    <p className="text-xs text-muted">{call.project}</p>
                  </div>
                  <Badge variant={call.status === "OPEN" ? "success" : call.status === "DRAFT" ? "warning" : "outline"}>
                    {call.status}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                  <span>{listRolesByCastingCall(call.id).length} roles</span>
                  <span>{formatDate(call.updatedAt)}</span>
                  <span>{call.city}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Latest activity</CardTitle>
            <CardDescription>Threads with talent move faster when messages stay under 24h.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {threads.map((thread) => (
              <div key={thread.thread.id} className="rounded-xl border border-[var(--color-border)] p-4 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[var(--color-text)]">{thread.applicantName}</p>
                  <span className="text-xs text-muted">{formatDate(thread.latestMessage.createdAt)}</span>
                </div>
                <p className="mt-2 text-xs text-muted">{thread.latestMessage.content}</p>
              </div>
            ))}
            {threads.length === 0 && <p className="text-sm text-muted">No active conversations yet.</p>}
          </CardContent>
        </Card>
      </div>

      <ShareLinkPanel initialLinks={shareLinks} hirerUserId={hirer.id} defaultRoleId={firstCall ? listRolesByCastingCall(firstCall.id)[0]?.id : undefined} />

      {firstCall && (
        <Card>
          <CardHeader>
            <CardTitle>Kanban – {firstCall.title}</CardTitle>
            <CardDescription>Track applicants as they move from applied to contacted.</CardDescription>
          </CardHeader>
          <CardContent>
            <KanbanBoard columns={kanbanColumns} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
