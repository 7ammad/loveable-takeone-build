import { prisma } from './client';
import type { CasterProfile, Prisma } from '@prisma/client';

type CasterProfileCreationData = Prisma.CasterProfileCreateInput;
type CasterProfileUpdateData = Partial<CasterProfileCreationData>;

/**
 * Creates a new caster profile
 * @param profileData - The data for the new caster profile.
 * @returns The newly created caster profile.
 */
export async function createCasterProfile(profileData: CasterProfileCreationData): Promise<CasterProfile> {
  return prisma.casterProfile.create({
    data: profileData,
  });
}

/**
 * Updates an existing caster profile
 * @param profileId - The ID of the caster profile to update.
 * @param profileData - The data to update.
 * @returns The updated caster profile.
 */
export async function updateCasterProfile(profileId: string, profileData: CasterProfileUpdateData): Promise<CasterProfile> {
  return prisma.casterProfile.update({
    where: { id: profileId },
    data: profileData,
  });
}

/**
 * Gets a caster profile by user ID
 * @param userId The user ID to look up
 * @returns The caster profile or null if not found
 */
export async function getCasterProfileById(userId: string): Promise<CasterProfile | null> {
  return prisma.casterProfile.findFirst({
    where: { userId },
  });
}

