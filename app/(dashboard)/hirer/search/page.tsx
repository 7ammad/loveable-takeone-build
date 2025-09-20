import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { searchTalentProfiles, getSubscriptionByHirer } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function TalentSearchPage() {
  const hirer = await getCurrentUser("HIRER");
  const subscription = hirer ? getSubscriptionByHirer(hirer.id) : undefined;

  if (!hirer || !subscription || subscription.status !== "ACTIVE") {
    return (
      <Card>
        <CardContent className="space-y-3 text-sm text-muted">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Professional Access required</h2>
          <p>
            Upgrade to Professional Access to unlock full search, explainability, and shortlist sharing. During the pilot
            our concierge team can prepare curated lists once your subscription is active.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/hirer/subscription"
              className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white shadow-token-sm"
            >
              View plans
            </a>
            <a
              href="mailto:concierge@scm.sa"
              className="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-brand)]"
            >
              Contact concierge
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  const verifiedTalent = searchTalentProfiles({ verifiedOnly: true });

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine by verification status, dialects, and guardian-managed profiles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted">
          <div className="space-y-2">
            <Label htmlFor="query">Keyword</Label>
            <Input id="query" placeholder="Search by skill or project" defaultValue="Drama" />
          </div>
          <div className="space-y-2">
            <Label>Verification</Label>
            <div className="flex items-center gap-3">
              <Checkbox defaultChecked />
              <span>Verified talent only</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Talent type</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Checkbox defaultChecked />
                <span>Adults</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox />
                <span>Guardian-managed minors</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Languages</Label>
            <Input placeholder="Arabic" defaultValue="Arabic" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {verifiedTalent.map((talent) => {
          const explainability = [
            `Languages: ${talent.languages.join(", ")}`,
            `City: ${talent.city}`,
            talent.verified ? "Nafath verified" : undefined,
          ].filter(Boolean) as string[];

          return (
            <Card key={talent.id}>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      {talent.firstName} {talent.lastName}
                    </h3>
                    <p className="text-sm text-muted">{talent.bio}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted">
                    {talent.attributes.map((attribute) => (
                      <Badge key={`${talent.id}-${attribute.label}`} variant="outline">
                        {attribute.label}: {attribute.value}
                      </Badge>
                    ))}
                    <Badge variant="success">Verified</Badge>
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs text-muted">
                    <p className="font-semibold text-[var(--color-text)]">Why this result</p>
                    <ul className="mt-2 space-y-1">
                      {explainability.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-xs text-muted">
                  <span>{talent.languages.join(", ")}</span>
                  <span>{talent.city}</span>
                  <a href={`/talent/${talent.id}`} className="text-[var(--color-brand)]">
                    View profile →
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
