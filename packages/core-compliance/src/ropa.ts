import { prisma } from '@/packages/core-db/src/client';

export interface ProcessingActivity {
  name: string;
  purposes: string[];
  legalBasis: string;
  categoriesOfData: string[];
  categoriesOfRecipients: string[];
  retentionDays: number;
  securityMeasures: string[];
  dpiAssessmentRequired: boolean;
}

export interface RopaDocument {
  id: string;
  version: string;
  processingActivities: ProcessingActivity[];
  createdAt: Date;
  updatedAt: Date;
  reviewedBy: string;
}

/**
 * Get the current RoPA document
 */
export async function getCurrentRopa(): Promise<RopaDocument | null> {
  // In a real implementation, this would be stored in the database
  // For now, return a static RoPA document
  return {
    id: 'ropa-v1.0',
    version: '1.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    reviewedBy: 'Compliance Team',
    processingActivities: [
      {
        name: 'User Registration and Authentication',
        purposes: ['account_management', 'identity_verification'],
        legalBasis: 'consent',
        categoriesOfData: ['email', 'password_hash', 'identity_documents'],
        categoriesOfRecipients: ['internal_systems'],
        retentionDays: 2555, // 7 years
        securityMeasures: ['encryption_at_rest', 'access_controls', 'audit_logging'],
        dpiAssessmentRequired: false,
      },
      {
        name: 'Talent Profile Management',
        purposes: ['talent_discovery', 'casting_matching'],
        legalBasis: 'consent',
        categoriesOfData: ['personal_info', 'photos', 'videos', 'performance_history'],
        categoriesOfRecipients: ['hirers', 'internal_moderation'],
        retentionDays: 2555, // 7 years
        securityMeasures: ['encryption_at_rest', 'watermarking', 'access_controls'],
        dpiAssessmentRequired: true,
      },
      {
        name: 'Application Processing',
        purposes: ['casting_workflow', 'talent_matching'],
        legalBasis: 'consent',
        categoriesOfData: ['application_data', 'self_tapes', 'communication_logs'],
        categoriesOfRecipients: ['hirers', 'talent_guardians'],
        retentionDays: 365, // 1 year
        securityMeasures: ['encryption_at_rest', 'access_controls', 'audit_logging'],
        dpiAssessmentRequired: false,
      },
      {
        name: 'Payment Processing',
        purposes: ['subscription_billing', 'financial_transactions'],
        legalBasis: 'contract',
        categoriesOfData: ['payment_info', 'billing_address', 'transaction_history'],
        categoriesOfRecipients: ['payment_processors'],
        retentionDays: 2555, // 7 years (legal requirement)
        securityMeasures: ['tokenization', 'pci_compliance', 'encryption'],
        dpiAssessmentRequired: true,
      },
      {
        name: 'Guardian Consent Management',
        purposes: ['child_protection', 'legal_compliance'],
        legalBasis: 'legal_obligation',
        categoriesOfData: ['guardian_relationships', 'consent_records', 'age_verification'],
        categoriesOfRecipients: ['internal_compliance', 'legal_authorities'],
        retentionDays: 5840, // 16 years (until age of majority + margin)
        securityMeasures: ['encryption_at_rest', 'strict_access_controls', 'audit_logging'],
        dpiAssessmentRequired: true,
      },
    ],
  };
}

/**
 * Update the RoPA document
 */
export async function updateRopa(activities: ProcessingActivity[]): Promise<RopaDocument> {
  // In a real implementation, this would update the database
  const currentRopa = await getCurrentRopa();
  if (!currentRopa) {
    throw new Error('No current RoPA document found');
  }

  const updatedRopa: RopaDocument = {
    ...currentRopa,
    processingActivities: activities,
    updatedAt: new Date(),
  };

  // Log the update for audit purposes
  console.log('RoPA document updated:', {
    version: updatedRopa.version,
    activitiesCount: activities.length,
    updatedAt: updatedRopa.updatedAt,
  });

  return updatedRopa;
}

/**
 * Check if a processing activity requires DPIA
 */
export async function requiresDpia(activityName: string): Promise<boolean> {
  const ropa = await getCurrentRopa();
  const activity = ropa?.processingActivities.find(a => a.name === activityName);
  return activity?.dpiAssessmentRequired || false;
}

/**
 * Get retention period for a data category
 */
export async function getRetentionPeriod(activityName: string, dataCategory: string): Promise<number> {
  const ropa = await getCurrentRopa();
  const activity = ropa?.processingActivities.find(a => a.name === activityName);
  return activity?.retentionDays || 2555; // Default to 7 years
}
