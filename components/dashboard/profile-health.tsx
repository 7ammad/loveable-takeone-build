import type { TalentProfile } from "@/lib/definitions";
import { computeProfileHealth } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProfileHealthProps {
  profile: TalentProfile;
}

const statusMap = {
  needs_attention: {
    label: "Needs attention",
    badgeVariant: "danger" as const,
  },
  progressing: {
    label: "Progressing",
    badgeVariant: "warning" as const,
  },
  ready: {
    label: "Pilot ready",
    badgeVariant: "success" as const,
  },
};

export function ProfileHealth({ profile }: ProfileHealthProps) {
  const { score, status, suggestions } = computeProfileHealth(profile);
  const statusMeta = statusMap[status];

  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-6 shadow-token-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Profile health</h3>
          <p className="text-sm text-muted">Keep improving to reach the top of pilot shortlists.</p>
        </div>
        <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Overall score</span>
          <span className="font-semibold">{score}%</span>
        </div>
        <Progress value={score} />
      </div>
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Next best actions</p>
          <ul className="space-y-2 text-sm text-muted">
            {suggestions.slice(0, 3).map((suggestion) => (
              <li key={suggestion} className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[var(--color-brand)]" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
