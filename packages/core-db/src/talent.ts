import { prisma } from './client';
import type { TalentProfile, Prisma } from '@prisma/client';

type TalentProfileCreationData = Prisma.TalentProfileCreateInput;
type TalentProfileUpdateData = Partial<TalentProfileCreationData>;

/**
 * Creates a new talent profile and an outbox event to trigger indexing.
 * @param profileData - The data for the new talent profile.
 * @returns The newly created talent profile.
 */
export async function createTalentProfile(profileData: TalentProfileCreationData): Promise<TalentProfile> {
  return prisma.$transaction(async (tx) => {
    const newProfile = await tx.talentProfile.create({
      data: profileData,
    });

    await tx.outbox.create({
      data: {
        eventType: 'TalentProfileCreated',
        payload: { id: newProfile.id },
      },
    });

    return newProfile;
  });
}

/**
 * Updates an existing talent profile and an outbox event to trigger re-indexing.
 * @param profileId - The ID of the talent profile to update.
 * @param profileData - The data to update.
 * @returns The updated talent profile.
 */
export async function updateTalentProfile(profileId: string, profileData: TalentProfileUpdateData): Promise<TalentProfile> {
  return prisma.$transaction(async (tx) => {
    const updatedProfile = await tx.talentProfile.update({
      where: { id: profileId },
      data: profileData,
    });

    await tx.outbox.create({
      data: {
        eventType: 'TalentProfileUpdated',
        payload: { id: updatedProfile.id },
      },
    });

    return updatedProfile;
  });
}

/**
 * Gets a talent profile by user ID
 * @param userId The user ID to look up
 * @returns The talent profile or null if not found
 */
export async function getTalentProfileById(userId: string): Promise<TalentProfile | null> {
  return prisma.talentProfile.findFirst({
    where: { userId },
  });
}

