import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComplianceExportButton } from "@/components/admin/compliance-export-button";
import { listComplianceItems, getTalentProfileById, listModerationQueue } from "@/lib/db";
import { formatDate, classForStatus } from "@/lib/utils";

const items = listComplianceItems();
const moderationQueue = listModerationQueue();

export default function AdminCompliancePage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((item) => {
        const profile = getTalentProfileById(item.talentProfileId);
        return (
          <Card key={item.id} className="bg-[var(--color-elev-1)]">
            <CardHeader>
              <CardTitle>{item.documentType}</CardTitle>
              <CardDescription>
                {profile ? `${profile.firstName} ${profile.lastName}` : "Talent profile"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classForStatus(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Uploaded</span>
                <span>{formatDate(item.uploadedAt)}</span>
              </div>
              {item.expiresAt && (
                <div className="flex items-center justify-between text-xs">
                  <span>Expires</span>
                  <span>{formatDate(item.expiresAt)}</span>
                </div>
              )}
              <ComplianceExportButton subjectId={item.talentProfileId} />
            </CardContent>
          </Card>
        );
      })}

      {items.length === 0 && (
        <Card className="bg-[var(--color-elev-1)]">
          <CardContent>
            <p className="text-sm text-muted">No compliance items awaiting review.</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[var(--color-elev-1)] md:col-span-2">
        <CardHeader>
          <CardTitle>Moderation queue</CardTitle>
          <CardDescription>Auto-flagged assets waiting for human review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          {moderationQueue.map((item) => (
            <div key={item.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{item.filename}</p>
                  <p className="text-xs text-muted">Asset type: {item.assetType}</p>
                </div>
                <Badge variant={item.status === "PENDING" ? "warning" : item.status === "APPROVED" ? "success" : "danger"}>
                  {item.status}
                </Badge>
              </div>
              <p className="mt-2 text-xs">Submitted {formatDate(item.submittedAt)}</p>
              {item.autoFlags.length > 0 && (
                <p className="mt-1 text-xs">Auto flags: {item.autoFlags.join(", ")}</p>
              )}
            </div>
          ))}
          {moderationQueue.length === 0 && <p>No items pending moderation.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
