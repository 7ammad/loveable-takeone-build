import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KanbanColumn } from "@/lib/definitions";
import { getTalentProfileById, getStatusBadge } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";

interface KanbanBoardProps {
  columns: KanbanColumn[];
}

export function KanbanBoard({ columns }: KanbanBoardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((column) => (
        <Card key={column.id} className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold capitalize">{column.title}</CardTitle>
            <Badge variant="outline">{column.applications.length}</Badge>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            {column.applications.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No applicants yet.
              </div>
            )}
            {column.applications.map((application) => {
              const talent = getTalentProfileById(application.talentProfileId);
              return (
                <div
                  key={application.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {talent ? `${talent.firstName} ${talent.lastName}` : "Talent"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Applied {formatDate(application.createdAt)}
                      </p>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", getStatusBadge(application.status))}>
                      {application.status}
                    </span>
                  </div>
                  {talent && (
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {talent.languages.map((language) => (
                        <Badge key={language} variant="outline" className="border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                          {language}
                        </Badge>
                      ))}
                      {talent.city && (
                        <Badge variant="outline" className="border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                          {talent.city}
                        </Badge>
                      )}
                    </div>
                  )}
                  {application.notes && <p className="text-sm text-slate-600">{application.notes}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
