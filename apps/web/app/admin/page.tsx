import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminOverview, getComplianceItemsByStatus, getApplicationsWithStatus } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default function AdminOverviewPage() {
  const overview = getAdminOverview();
  const pendingCompliance = getComplianceItemsByStatus("PENDING");
  const flaggedApplications = getApplicationsWithStatus("REJECTED");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-slate-900/40">
        <CardHeader>
          <CardTitle>Platform health</CardTitle>
          <CardDescription>Snapshot of pilot adoption and trust metrics.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Total users</span>
            <span className="font-semibold text-emerald-300">{overview.userCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Verified talent</span>
            <span className="font-semibold text-emerald-300">{overview.verifiedTalent}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Active subscriptions</span>
            <span className="font-semibold text-emerald-300">{overview.activeSubscriptions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Compliance pending</span>
            <Badge variant="warning">{overview.compliancePending}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/40">
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Items requiring trust & safety attention.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          {pendingCompliance.map((item) => (
            <div key={item.id} className="rounded-2xl border border-emerald-500/20 p-4">
              <p className="font-semibold">{item.documentType}</p>
              <p className="text-xs text-slate-400">Uploaded {formatDate(item.uploadedAt)}</p>
            </div>
          ))}
          {pendingCompliance.length === 0 && <p>No pending compliance items.</p>}
          {flaggedApplications.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/20 p-4">
              <p className="font-semibold">{flaggedApplications.length} rejected applications this week</p>
              <p className="text-xs text-slate-400">Review for potential policy breaches.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
