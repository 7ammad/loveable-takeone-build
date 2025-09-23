"use server";

import { revalidatePath } from "next/cache";
import {
  findTalentProfileByUserId,
  getMessageThreadById,
  getTalentProfileById,
  getUserById,
  listCastingCallsByHirer,
  subscriptionPlans,
  createSavedSearch,
  deactivateSavedSearch,
  createShareLink,
} from "@/lib/db";
import type { CastingCallStatus, SubscriptionPlan, UserRole } from "@/lib/definitions";
import { sleep } from "@/lib/utils";
import { hasActiveSubscription } from "@/packages/core-security/src/subscription-gate";
import { addToOutbox } from "@/packages/core-queue/src/outbox";

export interface ActionResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  data?: T;
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<ActionResponse<{ redirectTo: string }>> {
  await sleep(600);
  void email;
  void password;

  const user = getUserById("user-hirer-1");
  const redirectTo = user?.role === "HIRER" ? "/hirer/dashboard" : "/talent/applications";
  return {
    success: true,
    message: `Welcome back${user ? `, ${user.fullName.split(" ")[0]}` : ""}!`,
    data: { redirectTo },
  };
}

export async function signUp({
  email,
  role,
}: {
  email: string;
  role: UserRole;
}): Promise<ActionResponse<{ redirectTo: string }>> {
  await sleep(800);
  void email;

  const redirectTo = role === "HIRER" ? "/hirer/subscription" : "/talent/nafath-verification";
  return {
    success: true,
    message: "Account created. We have sent a verification email to complete onboarding.",
    data: { redirectTo },
  };
}

export async function updateTalentProfile({
  userId,
  payload,
}: {
  userId: string;
  payload: Partial<{ bio: string; availability: string; attributes: Array<{ label: string; value: string }>; languages: string[]; skills: string[] }>;
}): Promise<ActionResponse> {
  await sleep(900);
  const profile = findTalentProfileByUserId(userId);
  if (!profile) {
    return {
      success: false,
      message: "We could not locate your profile. Please contact support.",
    };
  }

  revalidatePath("/talent/profile/edit");

  // Add to outbox for search indexing
  await addToOutbox('TalentProfileUpdated', {
    id: profile.id,
    userId,
    ...payload,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "Profile updated. Casting directors now see the latest information.",
    data: { profileId: profile.id, payload },
  };
}

export async function submitNafathVerification({
  userId,
}: {
  userId: string;
}): Promise<ActionResponse> {
  await sleep(1200);
  const user = getUserById(userId);
  if (!user) {
    return {
      success: false,
      message: "Unable to initiate Nafath flow. Try again or reach support.",
    };
  }

  revalidatePath("/talent/nafath-verification");
  return {
    success: true,
    message: "Nafath verification submitted. Expect confirmation within 6 working hours.",
    data: { userId },
  };
}

export async function createCastingCall({
  hirerUserId,
  payload,
}: {
  hirerUserId: string;
  payload: {
    title: string;
    project: string;
    status: CastingCallStatus;
    city: string;
    shootStart: string;
    shootEnd: string;
  };
}): Promise<ActionResponse> {
  await sleep(1000);

  // Check subscription for posting casting calls
  const hasSubscription = await hasActiveSubscription(hirerUserId);
  if (!hasSubscription) {
    return {
      success: false,
      message: "Active subscription required to post casting calls.",
    };
  }

  const castingCalls = listCastingCallsByHirer(hirerUserId);
  const mockId = `casting-call-${castingCalls.length + 10}`;
  revalidatePath("/hirer/dashboard");
  return {
    success: true,
    message: "Casting call drafted. Once you add roles it will move to OPEN status.",
    data: { id: mockId, ...payload },
  };
}

export async function startSubscription({
  hirerUserId,
  planId,
}: {
  hirerUserId: string;
  planId: SubscriptionPlan["id"];
}): Promise<ActionResponse<{ renewalDate: string }>> {
  await sleep(700);
  void hirerUserId;

  const plan = subscriptionPlans.find((item) => item.id === planId);
  if (!plan) {
    return { success: false, message: "Plan not found." };
  }
  const renewalDate = new Date();
  if (plan.billingInterval === "monthly") {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }
  revalidatePath("/hirer/subscription");
  return {
    success: true,
    message: "Subscription activated successfully.",
    data: { renewalDate: renewalDate.toISOString() },
  };
}

export async function requestComplianceReview({
  talentProfileId,
}: {
  talentProfileId: string;
}): Promise<ActionResponse> {
  await sleep(600);
  const profile = getTalentProfileById(talentProfileId);
  if (!profile) {
    return { success: false, message: "Profile not found." };
  }
  revalidatePath("/admin/compliance");
  return {
    success: true,
    message: "Compliance team notified. Expect a decision within 24 hours.",
  };
}

export async function escalateThread({
  threadId,
}: {
  threadId: string;
}): Promise<ActionResponse> {
  await sleep(500);
  const thread = getMessageThreadById(threadId);
  return {
    success: Boolean(thread),
    message: thread ? "Thread escalated to trust & safety." : "Thread not found, no escalation performed.",
  };
}


export async function saveSearch({
  userId,
  name,
  params,
  channels,
  frequency,
}: {
  userId: string;
  name: string;
  params: Record<string, unknown>;
  channels: Array<"email" | "sms">;
  frequency?: "instant" | "daily" | "weekly";
}): Promise<ActionResponse<{ id: string }>> {
  await sleep(500);
  const saved = createSavedSearch({ userId, name, params, channels, frequency });
  revalidatePath("/talent/applications");
  return {
    success: true,
    message: "Saved search created. We’ll notify you based on your selected frequency.",
    data: { id: saved.id },
  };
}

export async function disableSavedSearch(id: string): Promise<ActionResponse> {
  await sleep(300);
  const success = deactivateSavedSearch(id);
  if (!success) {
    return { success: false, message: "Saved search not found." };
  }
  revalidatePath("/talent/applications");
  return { success: true, message: "Saved search deactivated." };
}

export async function generateShareLink({
  entityType,
  entityId,
  createdByUserId,
  expiresAt,
}: {
  entityType: "Shortlist" | "Role";
  entityId: string;
  createdByUserId: string;
  expiresAt: string;
}): Promise<ActionResponse<{ token: string }>> {
  await sleep(400);
  const link = createShareLink({ entityType, entityId, createdByUserId, expiresAt });
  revalidatePath("/hirer/dashboard");
  return {
    success: true,
    message: "Share link generated.",
    data: { token: link.token },
  };
}

export async function createMediaUploadRequest({
  userId,
  filename,
  mime,
}: {
  userId: string;
  filename: string;
  mime: string;
}): Promise<ActionResponse<{ uploadUrl: string; fileUrl: string }>> {
  await sleep(400);
  const fakeToken = Math.random().toString(36).slice(2, 10);
  void mime;
  return {
    success: true,
    message: "Upload ready. Please send the file within 5 minutes.",
    data: {
      uploadUrl: `https://uploads.mock/${fakeToken}`,
      fileUrl: `https://cdn.mock/${userId}/${filename}`,
    },
  };
}

export async function exportCompliancePack({
  subjectId,
}: {
  subjectId: string;
}): Promise<ActionResponse<{ downloadUrl: string }>> {
  await sleep(500);
  const downloadUrl = `https://cdn.mock/compliance/${subjectId}.zip`;
  return {
    success: true,
    message: "Compliance pack assembled.",
    data: { downloadUrl },
  };
}

