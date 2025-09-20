"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Flow = "talent" | "guardian";

const skillOptions = ["Acting", "Modeling", "Voice", "Extra", "Presenter"];
const guardianRelationshipOptions = ["Parent", "Sibling", "Relative", "Legal guardian"];

export function OnboardingWizard() {
  const [flow, setFlow] = useState<Flow>("talent");
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const [talentData, setTalentData] = useState({
    skills: new Set<string>(["Acting"]),
    stageName: "",
    city: "Riyadh",
    languages: "Arabic, English",
    bio: "",
    headshots: 2,
    reels: 1,
    resumeLink: "",
    verificationReady: true,
  });

  const [guardianData, setGuardianData] = useState({
    relationship: "Parent",
    legalName: "",
    minorStageName: "",
    minorAgeBracket: "12-14",
    minorCity: "Riyadh",
    mediaApproach: "Verified hirers only",
    complianceNotes: "",
  });

  const steps = useMemo(() => {
    if (flow === "talent") {
      return [
        {
          title: "Select core skills",
          description: "Choose the disciplines you want to highlight. This tunes saved search recommendations.",
          content: (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Pick at least one discipline. You can update this later from your profile.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {skillOptions.map((skill) => {
                  const checked = talentData.skills.has(skill);
                  return (
                    <label
                      key={skill}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elev-1)] px-4 py-3 text-sm",
                        checked && "border-[var(--color-brand)] bg-[var(--color-brand)]/10",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(event) => {
                          setTalentData((prev) => {
                            const next = new Set(prev.skills);
                            if (event.target.checked) {
                              next.add(skill);
                            } else {
                              next.delete(skill);
                            }
                            return { ...prev, skills: next };
                          });
                        }}
                      />
                      {skill}
                    </label>
                  );
                })}
              </div>
            </div>
          ),
        },
        {
          title: "Essential details",
          description: "Tell hirers where you are based and the languages you work in.",
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="stageName">
                  Stage name
                </label>
                <Input
                  id="stageName"
                  value={talentData.stageName}
                  onChange={(event) => setTalentData((prev) => ({ ...prev, stageName: event.target.value }))}
                  placeholder="Amira Alharbi"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="city">
                  City
                </label>
                <Input
                  id="city"
                  value={talentData.city}
                  onChange={(event) => setTalentData((prev) => ({ ...prev, city: event.target.value }))}
                  placeholder="Riyadh"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium" htmlFor="languages">
                  Languages
                </label>
                <Input
                  id="languages"
                  value={talentData.languages}
                  onChange={(event) => setTalentData((prev) => ({ ...prev, languages: event.target.value }))}
                  placeholder="Arabic, English"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium" htmlFor="bio">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={talentData.bio}
                  onChange={(event) => setTalentData((prev) => ({ ...prev, bio: event.target.value }))}
                  placeholder="Share headline experience, accents, or standout roles."
                />
              </div>
            </div>
          ),
        },
        {
          title: "Media & resume",
          description: "Upload headshots and reels so hirers can evaluate quickly.",
          content: (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="headshots">
                  Headshots count
                </label>
                <Input
                  id="headshots"
                  type="number"
                  min={0}
                  value={talentData.headshots}
                  onChange={(event) => setTalentData((prev) => ({ ...prev, headshots: Number(event.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reels">
                  Reels count
                </label>
                <Input
                  id="reels"
                  type="number"
                  min={0}
                  value={talentData.reels}
                  onChange={(event) => setTalentData((prev) => ({ ...prev, reels: Number(event.target.value) }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-3">
                <label className="text-sm font-medium" htmlFor="resumeLink">
                  Resume or credits link
                </label>
                <Input
                  id="resumeLink"
                  value={talentData.resumeLink}
                  onChange={(event) => setTalentData((prev) => ({ ...prev, resumeLink: event.target.value }))}
                  placeholder="https://portfolio.example"
                />
              </div>
            </div>
          ),
        },
        {
          title: "Verification prep",
          description: "Confirm you’re ready to complete Nafath before applying to roles.",
          content: (
            <div className="space-y-3 text-sm text-muted">
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={talentData.verificationReady}
                  onChange={(event) =>
                    setTalentData((prev) => ({ ...prev, verificationReady: event.target.checked }))
                  }
                />
                I understand Nafath verification is required before any application.
              </label>
              <p>
                Keep your government ID ready and ensure your Nafath-linked mobile number is active. Verification
                typically completes within 6 working hours.
              </p>
            </div>
          ),
        },
      ];
    }

    return [
      {
        title: "Guardian details",
        description: "We’ll verify you before any minor profile can apply.",
        content: (
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="guardianName">
                Legal name
              </label>
              <Input
                id="guardianName"
                value={guardianData.legalName}
                onChange={(event) => setGuardianData((prev) => ({ ...prev, legalName: event.target.value }))}
                placeholder="Hala Al Rashid"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="relationship">
                Relationship
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {guardianRelationshipOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGuardianData((prev) => ({ ...prev, relationship: option }))}
                    className={cn(
                      "rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm",
                      guardianData.relationship === option &&
                        "border-[var(--color-brand)] bg-[var(--color-brand)]/10",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Create minor profile",
        description: "This stays guardian-controlled and hidden from public contact.",
        content: (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="minorStageName">
                Stage name
              </label>
              <Input
                id="minorStageName"
                value={guardianData.minorStageName}
                onChange={(event) => setGuardianData((prev) => ({ ...prev, minorStageName: event.target.value }))}
                placeholder="Lina Al Rashid"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="minorAge">
                Age bracket
              </label>
              <Input
                id="minorAge"
                value={guardianData.minorAgeBracket}
                onChange={(event) => setGuardianData((prev) => ({ ...prev, minorAgeBracket: event.target.value }))}
                placeholder="12-14"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="minorCity">
                City
              </label>
              <Input
                id="minorCity"
                value={guardianData.minorCity}
                onChange={(event) => setGuardianData((prev) => ({ ...prev, minorCity: event.target.value }))}
                placeholder="Riyadh"
              />
            </div>
          </div>
        ),
      },
      {
        title: "Privacy & media",
        description: "Guardians decide who can see media and when it’s shared.",
        content: (
          <div className="space-y-4 text-sm">
            <label className="space-y-2">
              <span className="text-sm font-medium">Default visibility</span>
              <Textarea
                value={guardianData.mediaApproach}
                onChange={(event) => setGuardianData((prev) => ({ ...prev, mediaApproach: event.target.value }))}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Compliance notes</span>
              <Textarea
                value={guardianData.complianceNotes}
                onChange={(event) => setGuardianData((prev) => ({ ...prev, complianceNotes: event.target.value }))}
                placeholder="List documents you already have ready (e.g., consent forms, school letters)."
              />
            </label>
          </div>
        ),
      },
      {
        title: "Verification prep",
        description: "Ensure your Nafath-linked mobile number is active before requesting access.",
        content: (
          <div className="space-y-3 text-sm text-white/90">
            <p>
              Guardians must complete Nafath verification before any minor can apply. We’ll guide you step-by-step and
              notify you within 6 working hours of completion.
            </p>
            <p>Concierge support is available at concierge@scm.sa if you need help gathering compliance documents.</p>
          </div>
        ),
      },
    ];
  }, [flow, talentData, guardianData]);

  const progress = Math.round(((stepIndex + (completed ? 1 : 0)) / steps.length) * 100);

  function resetFlow(nextFlow: Flow) {
    setFlow(nextFlow);
    setStepIndex(0);
    setCompleted(false);
  }

  function goNext() {
    if (stepIndex === steps.length - 1) {
      setCompleted(true);
      return;
    }
    setStepIndex((prev) => prev + 1);
  }

  function goBack() {
    setCompleted(false);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Onboarding checklist</h1>
          <p className="text-sm text-muted">
            Complete each step to reach a healthy profile score and unlock pilot invites.
          </p>
        </div>
        <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-1 text-sm">
          <button
            type="button"
            onClick={() => resetFlow("talent")}
            className={cn(
              "rounded-[calc(var(--radius-md)_-_2px)] px-3 py-1.5 font-medium transition",
              flow === "talent"
                ? "bg-[var(--color-brand)] text-white"
                : "text-muted hover:text-[var(--color-text)]",
            )}
          >
            Talent
          </button>
          <button
            type="button"
            onClick={() => resetFlow("guardian")}
            className={cn(
              "rounded-[calc(var(--radius-md)_-_2px)] px-3 py-1.5 font-medium transition",
              flow === "guardian"
                ? "bg-[var(--color-brand)] text-white"
                : "text-muted hover:text-[var(--color-text)]",
            )}
          >
            Guardian
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Progress</p>
            <Progress value={completed ? 100 : progress} />
            <p className="text-xs text-muted">
              Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}
            </p>
          </div>
          <ol className="space-y-2 text-sm">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className={cn(
                  "rounded-[var(--radius-md)] border border-transparent px-3 py-2",
                  index === stepIndex && "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand-600)]",
                  index < stepIndex && "text-[var(--color-brand-600)]",
                )}
              >
                {step.title}
              </li>
            ))}
          </ol>
        </aside>

        <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-6 shadow-token-sm">
          {completed ? (
            <div className="space-y-4 text-sm">
              <h2 className="text-xl font-semibold">Checklist complete</h2>
              <p className="text-muted">
                Great work! Your information is ready for the concierge team to review. Next, upload fresh media and
                complete Nafath so you can start receiving pilot invitations.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/talent/profile/edit" className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white shadow-token-sm">Go to profile editor</Link>
                <Button variant="outline" onClick={() => setCompleted(false)}>
                  Review steps
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{steps[stepIndex].title}</h2>
                <p className="text-sm text-muted">{steps[stepIndex].description}</p>
              </div>
              <div>{steps[stepIndex].content}</div>
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
                  Back
                </Button>
                <Button onClick={goNext}>
                  {stepIndex === steps.length - 1 ? "Finish" : "Continue"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
