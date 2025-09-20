import { TalentProfileForm } from "@/components/forms/talent-profile-form";
import { ProfileHealth } from "@/components/dashboard/profile-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTalentProfile } from "@/lib/auth";

export default async function TalentProfileEditPage() {
  const profile = await getCurrentTalentProfile();

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted">
            We could not find a talent profile linked to your account. Please contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Profile editor</CardTitle>
        </CardHeader>
        <CardContent>
          <TalentProfileForm profile={profile} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <ProfileHealth profile={profile} />
        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>Watermarked self-tapes and verified credits increase shortlist placement.</p>
            <p>Use the onboarding checklist to complete any missing steps before the pilot opens.</p>
            <p>Need a hand? Email concierge@scm.sa and the team will review your materials.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
