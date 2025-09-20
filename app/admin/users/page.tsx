import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listUsers, getGuardianDashboard } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const users = listUsers();
const guardianProfiles = getGuardianDashboard();

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/40">
        <CardHeader>
          <CardTitle>User directory</CardTitle>
          <CardDescription>Search and moderate user accounts across roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-slate-100">{user.fullName}</TableCell>
                  <TableCell className="uppercase text-xs text-emerald-200">{user.role}</TableCell>
                  <TableCell className="text-slate-400">{user.email}</TableCell>
                  <TableCell className="text-slate-400">{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/40">
        <CardHeader>
          <CardTitle>Guardian-managed profiles</CardTitle>
          <CardDescription>Review guardianship relationships before approving compliance requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          {guardianProfiles.map(({ guardian, profile }) => (
            <div key={profile.id} className="rounded-2xl border border-emerald-500/20 p-4">
              <p className="font-semibold">{profile.firstName} {profile.lastName}</p>
              <p className="text-xs text-slate-400">
                Guardian: {guardian.fullName} · {guardian.email}
              </p>
            </div>
          ))}
          {guardianProfiles.length === 0 && <p>No guardian-managed profiles yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
