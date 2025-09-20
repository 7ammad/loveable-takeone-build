import type { TalentProfile } from "@/lib/definitions";
export type Trend = "up" | "down" | "flat";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number, currency: string = "SAR"): string {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date, locale: string = "en-SA"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(value: string | Date, locale: string = "en-SA"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function percentage(part: number, total: number): number {
  if (!total) {
    return 0;
  }
  return Math.round((part / total) * 100);
}

export const statusColorMap: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-amber-100 text-amber-700",
  CONTACTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  OPEN: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-200 text-slate-700",
  DRAFT: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-rose-100 text-rose-700",
  "PAST_DUE": "bg-amber-100 text-amber-700",
};

export function classForStatus(status: string): string {
  return statusColorMap[status] ?? "bg-slate-100 text-slate-600";
}

export function humanize(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function computeProfileHealth(profile: TalentProfile): {
  score: number;
  status: "needs_attention" | "progressing" | "ready";
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];

  if (profile.bio.trim().length >= 120) {
    score += 25;
  } else {
    suggestions.push("Expand your bio to highlight key roles and accents.");
  }

  if (profile.availability.trim().length > 0) {
    score += 10;
  } else {
    suggestions.push("Add availability notes so hirers know when you can audition.");
  }

  if (profile.languages.length > 0) {
    score += 15;
  } else {
    suggestions.push("List the languages you perform in.");
  }

  if (profile.media.length >= 2) {
    score += 20;
  } else {
    suggestions.push("Upload at least two headshots or reels.");
  }

  const hasSkillsAttribute = profile.attributes.some((attribute) => attribute.label.toLowerCase() === "skills" && attribute.value.trim());
  if (hasSkillsAttribute) {
    score += 15;
  } else {
    suggestions.push("Add a skills attribute to surface in filtered searches.");
  }

  if (profile.verified) {
    score += 15;
  } else {
    suggestions.push("Complete Nafath verification to unlock applications.");
  }

  const cappedScore = Math.min(score, 100);
  let status: "needs_attention" | "progressing" | "ready" = "needs_attention";

  if (cappedScore >= 80) {
    status = "ready";
  } else if (cappedScore >= 50) {
    status = "progressing";
  }

  return { score: cappedScore, status, suggestions };
}
