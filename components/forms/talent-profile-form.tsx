"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TalentProfile } from "@/lib/definitions";
import { updateTalentProfile } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { MediaUploadStub } from "@/components/media/upload-stub";

interface TalentProfileFormProps {
  profile: TalentProfile;
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "media", label: "Media" },
  { id: "credits", label: "Credits" },
  { id: "compliance", label: "Compliance" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function TalentProfileForm({ profile }: TalentProfileFormProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [bio, setBio] = useState(profile.bio);
  const [availability, setAvailability] = useState(profile.availability);
  const [attributes, setAttributes] = useState(profile.attributes);
  const [languagesInput, setLanguagesInput] = useState(profile.languages.join(", "));
  const initialSkills = useMemo(
    () => profile.attributes.find((attribute) => attribute.label.toLowerCase() === "skills")?.value ?? "",
    [profile.attributes],
  );
  const [skillsInput, setSkillsInput] = useState(initialSkills);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAttributeChange(index: number, value: string) {
    const updated = [...attributes];
    updated[index] = { ...updated[index], value };
    setAttributes(updated);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const languages = languagesInput
      .split(",")
      .map((lang) => lang.trim())
      .filter(Boolean);

    const updatedAttributes = attributes.map((attribute) =>
      attribute.label.toLowerCase() === "skills" ? { ...attribute, value: skillsInput } : attribute,
    );

    setAttributes(updatedAttributes);

    startTransition(async () => {
      const response = await updateTalentProfile({
        userId: profile.userId,
        payload: {
          bio,
          availability,
          attributes: updatedAttributes,
          languages,
          skills: skillsInput.split(",").map((skill) => skill.trim()).filter(Boolean),
        },
      });
      setMessage(response.message);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium",
              activeTab === tab.id && "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand-600)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bio">Professional bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                minLength={80}
                required
              />
              <p className="text-xs text-muted">Detailed bios receive 3.5× more shortlist requests.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability notes</Label>
              <Textarea
                id="availability"
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Input
                id="languages"
                value={languagesInput}
                onChange={(event) => setLanguagesInput(event.target.value)}
                placeholder="Arabic, English"
              />
              <p className="text-xs text-muted">Comma-separated; used in search filters and saved alerts.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Key skills</Label>
              <Input
                id="skills"
                value={skillsInput}
                onChange={(event) => setSkillsInput(event.target.value)}
                placeholder="Stage combat, Voiceover"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Key attributes</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {attributes.map((attribute, index) => (
                <div key={`${attribute.label}-${index}`} className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {attribute.label}
                  </Label>
                  <Input
                    value={attribute.value}
                    onChange={(event) => handleAttributeChange(index, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" loading={isPending}>
              Save profile updates
            </Button>
            {message && (
              <p className="rounded-[var(--radius-md)] bg-[var(--color-brand)]/10 px-4 py-2 text-sm text-[var(--color-brand-600)]">
                {message}
              </p>
            )}
          </div>
        </form>
      )}

      {activeTab === "media" && (
        <div className="space-y-4">
          <div className="space-y-2 text-sm text-muted">
            <p>
              Upload headshots and reels from here. Files are watermarked automatically and run through moderation before
              hirers can view them.
            </p>
          </div>
          <MediaUploadStub userId={profile.userId} />
        </div>
      )}

      {activeTab === "credits" && (
        <div className="space-y-4 text-sm text-muted">
          <p>
            Credits imported from your profile appear here. For now, add credits via the concierge team or include them in
            your bio while we finalise the structured credits editor.
          </p>
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="space-y-4 text-sm text-muted">
          <p>
            Ensure your consent forms and PDPL acknowledgements are ready. Guardians can upload documents from the
            compliance hub and track approvals.
          </p>
          <p>
            Need help? Email
            <a href="mailto:compliance@scm.sa" className="ml-1 font-semibold text-[var(--color-brand)]">
              compliance@scm.sa
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}

