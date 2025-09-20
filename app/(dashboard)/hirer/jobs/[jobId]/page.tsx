import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  getCastingCallById,
  listRolesByCastingCall,
  listApplicationsByCastingCall,
  getTalentProfileById,
} from "@/lib/db";
import { formatDate, classForStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: { jobId: string };
}

export default function CastingCallDetailPage({ params }: PageProps) {
  const castingCall = getCastingCallById(params.jobId);
  if (!castingCall) {
    notFound();
  }

  const roles = listRolesByCastingCall(castingCall.id);
  const applicants = listApplicationsByCastingCall(castingCall.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{castingCall.title}</CardTitle>
          <CardDescription>{castingCall.project}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <Badge variant={castingCall.status === "OPEN" ? "success" : castingCall.status === "DRAFT" ? "warning" : "outline"}>
              {castingCall.status}
            </Badge>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Shoot window</p>
            <p className="text-sm text-slate-700">
              {formatDate(castingCall.shootingStart)} – {formatDate(castingCall.shootingEnd)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
            <p className="text-sm text-slate-700">{castingCall.city}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Applicants</p>
            <p className="text-sm text-slate-700">{applicants.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Each role should have requirements, rates, and compliance notes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{role.title}</h3>
                  <Badge variant="outline">{role.rate}</Badge>
                </div>
                <p className="text-sm text-slate-600">{role.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {role.requirements.map((requirement) => (
                    <Badge key={requirement.label} variant="outline">
                      {requirement.label}: {requirement.value}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applicants</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {applicants.map((application) => {
            const talent = getTalentProfileById(application.talentProfileId);
            return (
              <div key={application.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {talent ? `${talent.firstName} ${talent.lastName}` : "Talent"}
                    </p>
                    <p className="text-xs text-slate-500">Updated {formatDate(application.updatedAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classForStatus(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                {application.notes && <p className="mt-3 text-sm text-slate-600">{application.notes}</p>}
              </div>
            );
          })}
          {applicants.length === 0 && <p className="text-sm text-slate-500">No applicants yet. Share the call to talent lists.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
