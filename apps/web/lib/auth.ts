import {
  findTalentProfileByUserId,
  getUserById,
  listGuardianManagedProfiles,
  listUsers,
} from "@/lib/db";
import type { GuardianManagedProfile, TalentProfile, User, UserRole } from "@/lib/definitions";

const DEFAULT_USER_ID = "user-hirer-1";

function readUserOverride(): string | null {
  return null;
}

export async function getCurrentUser(preferredRole?: UserRole): Promise<User | undefined> {
  if (preferredRole) {
    return listUsers().find((user) => user.role === preferredRole);
  }
  const overrideId = readUserOverride();
  if (overrideId) {
    return getUserById(overrideId);
  }
  return getUserById(DEFAULT_USER_ID);
}

export async function getCurrentTalentProfile(): Promise<TalentProfile | undefined> {
  const overrideId = readUserOverride();
  if (overrideId) {
    return findTalentProfileByUserId(overrideId);
  }
  return findTalentProfileByUserId("user-talent-1");
}

export async function getGuardianWorkspace(): Promise<GuardianManagedProfile[]> {
  return listGuardianManagedProfiles();
}

export function requireUserRole(user: User | undefined, roles: UserRole[]): void {
  if (!user || !roles.includes(user.role)) {
    throw new Error("Unauthorized: missing required role");
  }
}

export async function getUserDisplayName(): Promise<string> {
  const user = await getCurrentUser();
  return user?.fullName ?? "Guest";
}

export async function impersonate(role: UserRole): Promise<User | undefined> {
  return getCurrentUser(role);
}
