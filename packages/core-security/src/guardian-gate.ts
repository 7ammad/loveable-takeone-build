import { getTalentProfileById } from '@/lib/db';

/**
 * Checks if a user is a minor (under 18)
 * @param userId The user ID to check
 * @returns True if the user is a minor, false otherwise
 */
export async function isMinor(userId: string): Promise<boolean> {
  const profile = getTalentProfileById(userId);
  return profile?.isMinor === true;
}

/**
 * Checks if a minor user has an approved guardian
 * @param userId The minor user ID to check
 * @returns True if guardian exists and is approved, false otherwise
 */
export async function hasApprovedGuardian(userId: string): Promise<boolean> {
  const profile = getTalentProfileById(userId);
  return profile?.isMinor === true && !!profile?.guardianUserId;
}

/**
 * Enforces guardian gate for minor users
 * @param userId User ID performing the action
 * @param operation Operation being performed
 * @throws Error if operation requires guardian consent but none exists
 */
export async function enforceGuardianGate(userId: string, operation: string): Promise<void> {
  const isUserMinor = await isMinor(userId);

  if (!isUserMinor) {
    return; // Adult users can perform any operation
  }

  // For minors, check guardian approval for sensitive operations
  if (operation === 'send_message' || operation === 'apply_to_casting' || operation === 'upload_media') {
    const hasGuardian = await hasApprovedGuardian(userId);
    if (!hasGuardian) {
      throw new Error('Guardian consent required for this operation');
    }
  }
}

/**
 * Checks if a message can be sent to a recipient (blocks direct messages to minors)
 * @param senderId User sending the message
 * @param recipientId User receiving the message
 * @returns True if message can be sent, false if blocked
 */
export async function canSendMessage(senderId: string, recipientId: string): Promise<boolean> {
  // Check if recipient is a minor
  const recipientIsMinor = await isMinor(recipientId);
  if (!recipientIsMinor) {
    return true; // Can send to adults
  }

  // If recipient is minor, sender must be their guardian
  const recipientProfile = getTalentProfileById(recipientId);
  return recipientProfile?.guardianUserId === senderId;
}

/**
 * Gets the guardian ID for a minor user
 * @param userId The minor user ID
 * @returns Guardian user ID or null if none exists
 */
export async function getGuardianForMinor(userId: string): Promise<string | null> {
  const profile = getTalentProfileById(userId);
  if (profile?.isMinor && profile.guardianUserId) {
    return profile.guardianUserId;
  }
  return null;
}
