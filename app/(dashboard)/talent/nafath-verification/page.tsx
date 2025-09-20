import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, getCurrentTalentProfile } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { NafathRequest } from "@/components/forms/nafath-request";

const checklist = [
  "Government-issued ID ready for scan",
  "Linked Nafath mobile number",
  "Guardian present for minors",
  "Stable connection (verification takes ~2 minutes)",
];

export default async function NafathVerificationPage() {
  const user = await getCurrentUser();
  const profile = await getCurrentTalentProfile();

  const verifiedAt = user?.nafathVerifiedAt ?? profile?.updatedAt;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card>
        <CardHeader>
          <CardTitle>Nafath identity verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm text-slate-600">
          <p>
            Nafath verification is mandatory for all adult talent and guardians before they can apply to casting calls.
            Minors must be verified through their guardian accounts.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Before you begin
            </p>
            <ul className="mt-3 space-y-2">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {user && <NafathRequest userId={user.id} />}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Current status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Verification</span>
            <Badge variant={user?.nafathVerifiedAt ? "success" : "warning"}>
              {user?.nafathVerifiedAt ? "Verified" : "Pending"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Last check</span>
            <span className="text-xs text-slate-500">{verifiedAt ? formatDate(verifiedAt) : "Not started"}</span>
          </div>
          <p className="text-xs text-slate-500">
            Need assistance? Email <a className="font-semibold text-emerald-600" href="mailto:concierge@scm.sa">concierge@scm.sa</a> and our team will guide you through the Nafath flow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
