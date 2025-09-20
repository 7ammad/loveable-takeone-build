import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTalentProfileById } from "@/lib/db";

interface PageProps {
  params: { profileId: string };
}

export default function TalentProfilePage({ params }: PageProps) {
  const profile = getTalentProfileById(params.profileId);
  if (!profile) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>
              {profile.firstName} {profile.lastName}
            </CardTitle>
            <CardDescription>{profile.city}</CardDescription>
          </div>
          <Badge variant={profile.verified ? "success" : "warning"}>
            {profile.verified ? "Nafath Verified" : "Verification Pending"}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-xs uppercase tracking-wide text-slate-500">Languages</p>
              <p>{profile.languages.join(", ")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-xs uppercase tracking-wide text-slate-500">Availability</p>
              <p>{profile.availability}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Bio</h3>
            <p className="mt-3 text-sm text-slate-600">{profile.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              {profile.attributes.map((attribute) => (
                <Badge key={attribute.label} variant="outline">
                  {attribute.label}: {attribute.value}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {profile.media.map((media) => (
            <div key={media.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{media.title}</p>
              <p className="text-xs text-slate-500">{media.type === "video" ? "Video reel" : "Image"}</p>
              <a href={media.url} className="mt-3 inline-flex text-xs font-semibold text-emerald-600">
                Open asset -&gt;
              </a>
            </div>
          ))}
          {profile.media.length === 0 && <p className="text-sm text-slate-500">Media will appear once uploaded and approved.</p>}
        </CardContent>
      </Card>
    </main>
  );
}
