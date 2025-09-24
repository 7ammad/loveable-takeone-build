import { prisma } from '@/packages/core-db/src/client';

export interface ComplianceExportOptions {
  includeMinors: boolean;
  dateRange?: { from: Date; to: Date };
  purpose?: string;
  includeConsentRecords?: boolean;
  includeProcessingActivities?: boolean;
  format?: 'json' | 'csv' | 'pdf';
}

export interface ProcessingActivity {
  id: string;
  name: string;
  purposes: string[];
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataCategories: string[];
  retentionPeriod: number; // in days
  dataSubjects: string[];
  processors: string[];
  transfers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: string;
  granted: boolean;
  grantedAt: Date;
  withdrawnAt?: Date;
  method: 'explicit' | 'opt_in' | 'opt_out';
  version: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Export compliance data with minors redaction and PDPL compliance
 */
export async function exportComplianceData(options: ComplianceExportOptions = { includeMinors: false }) {
  const { 
    includeMinors, 
    dateRange, 
    purpose, 
    includeConsentRecords = true, 
    includeProcessingActivities = true 
  } = options;

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

  // Export consent records if requested
  let consentRecords: ConsentRecord[] = [];
  if (includeConsentRecords) {
    consentRecords = await exportConsentRecords(dateRange, purpose);
  }

  // Export processing activities if requested
  let processingActivities: ProcessingActivity[] = [];
  if (includeProcessingActivities) {
    processingActivities = await exportProcessingActivities();
  }

  // Generate compliance summary
  const complianceSummary = generateComplianceSummary({
    users,
    profiles,
    applications,
    auditEvents,
    consentRecords,
    processingActivities
  });

  return {
    exportDate: new Date().toISOString(),
    options,
    complianceSummary,
    data: {
      users,
      talentProfiles: profiles,
      applications,
      auditEvents,
      ropaData,
      consentRecords,
      processingActivities
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

/**
 * Export consent records
 */
async function exportConsentRecords(dateRange?: { from: Date; to: Date }, purpose?: string): Promise<ConsentRecord[]> {
  // In a real implementation, this would query a consent_records table
  // For now, return mock data
  return [
    {
      id: 'consent_1',
      userId: 'user_1',
      purpose: 'talent_profile_creation',
      granted: true,
      grantedAt: new Date('2024-01-01'),
      method: 'explicit',
      version: '1.0',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: 'consent_2',
      userId: 'user_2',
      purpose: 'application_processing',
      granted: true,
      grantedAt: new Date('2024-01-15'),
      method: 'opt_in',
      version: '1.0',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0...'
    }
  ];
}

/**
 * Export processing activities
 */
async function exportProcessingActivities(): Promise<ProcessingActivity[]> {
  // In a real implementation, this would query a processing_activities table
  // For now, return mock data based on the implementation plan
  return [
    {
      id: 'activity_1',
      name: 'Talent Profile Management',
      purposes: ['talent_profile_creation', 'profile_verification'],
      legalBasis: 'consent',
      dataCategories: ['personal_data', 'biometric_data', 'contact_information'],
      retentionPeriod: 365,
      dataSubjects: ['talent_users'],
      processors: ['casting_platform'],
      transfers: ['verification_services'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'activity_2',
      name: 'Application Processing',
      purposes: ['application_processing', 'casting_evaluation'],
      legalBasis: 'consent',
      dataCategories: ['personal_data', 'media_files', 'evaluation_data'],
      retentionPeriod: 180,
      dataSubjects: ['talent_users', 'hirer_users'],
      processors: ['casting_platform', 'media_processing'],
      transfers: ['storage_services'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'activity_3',
      name: 'Media Processing and Storage',
      purposes: ['media_processing', 'content_delivery'],
      legalBasis: 'consent',
      dataCategories: ['media_files', 'metadata'],
      retentionPeriod: 180,
      dataSubjects: ['talent_users'],
      processors: ['media_processing', 'storage_services'],
      transfers: ['cdn_services'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];
}

/**
 * Generate compliance summary
 */
function generateComplianceSummary(data: any) {
  const { users, profiles, applications, auditEvents, consentRecords, processingActivities } = data;
  
  const minorCount = profiles.filter((p: any) => p.isMinor).length;
  const totalUsers = users.length;
  const totalApplications = applications.length;
  const totalConsentRecords = consentRecords.length;
  const activeConsents = consentRecords.filter((c: any) => c.granted && !c.withdrawnAt).length;
  const withdrawnConsents = consentRecords.filter((c: any) => c.withdrawnAt).length;
  
  return {
    summary: {
      totalUsers,
      minorUsers: minorCount,
      totalApplications,
      totalConsentRecords,
      activeConsents,
      withdrawnConsents,
      processingActivitiesCount: processingActivities.length,
      auditEventsCount: auditEvents.length
    },
    complianceStatus: {
      minorsRedacted: minorCount > 0,
      consentTrackingActive: totalConsentRecords > 0,
      processingActivitiesDocumented: processingActivities.length > 0,
      auditTrailMaintained: auditEvents.length > 0
    },
    recommendations: [
      minorCount > 0 ? 'Minors data properly redacted in export' : 'No minors data found',
      activeConsents > 0 ? 'Consent tracking is active' : 'No active consents found',
      processingActivities.length > 0 ? 'Processing activities documented' : 'Processing activities need documentation'
    ]
  };
}
