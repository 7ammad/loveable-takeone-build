import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Keep your contact information and alerts current for faster coordination.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" defaultValue={user?.fullName ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notifications">Notifications</Label>
            <div className="space-y-2 text-sm text-slate-600">
              <label className="flex items-center gap-3">
                <Checkbox defaultChecked />
                <span>Application updates</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox />
                <span>Concierge compliance alerts</span>
              </label>
            </div>
          </div>
          <Button className="mt-2 w-fit">Save changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Enable two-factor authentication and review recent sign-ins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <label className="flex items-center gap-3">
            <Checkbox defaultChecked />
            <span>Require Nafath confirmation for every new device</span>
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/30">
            <p className="font-semibold text-slate-700">Recent sessions</p>
            <ul className="mt-2 space-y-1">
              <li>Riyadh · Chrome on Windows · 2 hours ago</li>
              <li>Jeddah · Safari on iOS · 3 days ago</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
