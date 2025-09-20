import { CastingCallForm } from "@/components/forms/casting-call-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

const hints = [
  "Add at least one role with requirements to move calls from DRAFT to OPEN.",
  "Share compensation bands early to increase application volume.",
  "Use compliance notes to ask for consent forms or PDPL addenda.",
];

export default async function NewCastingCallPage() {
  const hirer = await getCurrentUser("HIRER");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card>
        <CardHeader>
          <CardTitle>Create casting call</CardTitle>
          <CardDescription>Draft the project, then add roles with detailed requirements.</CardDescription>
        </CardHeader>
        <CardContent>
          {hirer ? <CastingCallForm hirerUserId={hirer.id} /> : <p className="text-sm text-slate-500">Sign in as a hirer to create casting calls.</p>}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Pilot guidance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-500">
          {hints.map((hint) => (
            <div key={hint} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
              {hint}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
