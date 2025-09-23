import { prisma } from '@/packages/core-db/src/client';

export interface ComplianceExportOptions {
  includeMinors: boolean;
  dateRange?: { from: Date; to: Date };
  purpose?: string;
}

/**
 * Export compliance data with minors redaction
 */
export async function exportComplianceData(options: ComplianceExportOptions = { includeMinors: false }) {
  const { includeMinors, dateRange, purpose } = options;

  // Export user data
  const users = await exportUsers(includeMinors);

  // Export talent profiles
  const profiles = await exportTalentProfiles(includeMinors);

  // Export applications
  const applications = await exportApplications(includeMinors, dateRange);

  // Export audit events
  const auditEvents = await exportAuditEvents(dateRange, purpose);

  // Export processing activities (RoPA)
  const ropaData = await exportRopaData();

  return {
    exportDate: new Date().toISOString(),
    options,
    data: {
      users,
      talentProfiles: profiles,
      applications,
      auditEvents,
      ropaData,
    },
  };
}

/**
 * Export users with minors redaction
 */
async function exportUsers(includeMinors: boolean) {
  const users = await prisma.user.findMany();
  const talentProfiles = await prisma.talentProfile.findMany();

  // Create a map of userId to talent profile
  const profileMap = new Map(talentProfiles.map(profile => [profile.userId, profile]));

  return users.map((user) => {
    const profile = profileMap.get(user.id);
    const isMinor = profile?.isMinor;

    if (!includeMinors && isMinor) {
      // Redact PII for minors
      return {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: 'MINOR_REDACTED',
        email: 'REDACTED',
        hasGuardian: !!profile?.guardianUserId,
        isMinor: true,
      };
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: profile ? 'TALENT' : 'HIRER',
      isMinor,
    };
  });
}

/**
 * Export talent profiles with minors redaction
 */
async function exportTalentProfiles(includeMinors: boolean) {
  const profiles = await prisma.talentProfile.findMany();

  return profiles.map((profile) => {
    if (!includeMinors && profile.isMinor) {
      // Redact sensitive profile data for minors
      return {
        id: profile.id,
        userId: profile.userId,
        isMinor: true,
        guardianUserId: profile.guardianUserId,
        verified: profile.verified,
        // Note: Additional fields like city, languages, bio are not in Prisma schema
        // They would need to be added if required for compliance export
      };
    }

    return profile;
  });
}

/**
 * Export applications with minors redaction
 */
async function exportApplications(includeMinors: boolean, dateRange?: { from: Date; to: Date }) {
  const whereClause: any = {};
  if (dateRange) {
    whereClause.createdAt = {
      gte: dateRange.from,
      lte: dateRange.to,
    };
  }

  const applications = await prisma.application.findMany({
    where: whereClause,
  });

  // Get talent profiles for all applications
  const talentUserIds = applications.map(app => app.talentUserId);
  const talentProfiles = await prisma.talentProfile.findMany({
    where: {
      userId: { in: talentUserIds },
    },
  });

  const profileMap = new Map(talentProfiles.map(profile => [profile.userId, profile]));

  return applications.map((app) => {
    const profile = profileMap.get(app.talentUserId);
    const isMinor = profile?.isMinor;

    if (!includeMinors && isMinor) {
      // Redact application data for minors
      return {
        id: app.id,
        castingCallId: app.castingCallId,
        talentUserId: app.talentUserId,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        talentProfile: {
          id: profile?.id,
          isMinor: true,
        },
      };
    }

    return {
      ...app,
      talentProfile: profile,
    };
  });
}

/**
 * Export audit events
 */
async function exportAuditEvents(dateRange?: { from: Date; to: Date }, purpose?: string) {
  const whereClause: any = {};
  if (dateRange) {
    whereClause.createdAt = {
      gte: dateRange.from,
      lte: dateRange.to,
    };
  }
  if (purpose) {
    whereClause.purpose = purpose;
  }

  return await prisma.auditEvent.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Export RoPA data
 */
async function exportRopaData() {
  // This would be implemented when RoPA persistence is added
  return {
    message: 'RoPA data export not yet implemented',
  };
}
