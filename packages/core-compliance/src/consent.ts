import { prisma } from '@/packages/core-db/src/client';
import crypto from 'crypto';

export interface ConsentRequest {
  userId: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataCategories: string[];
  retentionPeriod: number; // in days
  method: 'explicit' | 'opt_in' | 'opt_out';
  ipAddress?: string;
  userAgent?: string;
  version: string;
}

export interface ConsentResponse {
  id: string;
  granted: boolean;
  token: string;
  expiresAt: Date;
  version: string;
}

export interface ConsentVerification {
  valid: boolean;
  consentId?: string;
  purpose?: string;
  granted?: boolean;
  expiresAt?: Date;
  error?: string;
}

/**
 * Capture user consent for data processing
 */
export async function captureConsent(request: ConsentRequest): Promise<ConsentResponse> {
  const consentId = crypto.randomUUID();
  const token = generateConsentToken(consentId, request.userId, request.purpose);
  const expiresAt = new Date(Date.now() + (request.retentionPeriod * 24 * 60 * 60 * 1000));

  // In a real implementation, this would save to a consent_records table
  // For now, we'll just return the consent response
  const consentRecord = {
    id: consentId,
    userId: request.userId,
    purpose: request.purpose,
    legalBasis: request.legalBasis,
    dataCategories: request.dataCategories,
    retentionPeriod: request.retentionPeriod,
    method: request.method,
    granted: true, // Assuming consent is granted
    grantedAt: new Date(),
    version: request.version,
    ipAddress: request.ipAddress,
    userAgent: request.userAgent,
    token,
    expiresAt
  };

  // Log consent capture for audit
  await logConsentEvent('consent_captured', {
    consentId,
    userId: request.userId,
    purpose: request.purpose,
    method: request.method,
    ipAddress: request.ipAddress
  });

  return {
    id: consentId,
    granted: true,
    token,
    expiresAt,
    version: request.version
  };
}

/**
 * Verify consent for data processing
 */
export async function verifyConsent(
  userId: string, 
  purpose: string, 
  token?: string
): Promise<ConsentVerification> {
  try {
    // In a real implementation, this would query the consent_records table
    // For now, we'll return a mock verification
    
    if (!token) {
      return {
        valid: false,
        error: 'No consent token provided'
      };
    }

    // Mock token verification
    const isValidToken = /^[a-f0-9-]{36}$/.test(token);
    if (!isValidToken) {
      return {
        valid: false,
        error: 'Invalid consent token format'
      };
    }

    // Mock consent verification - in real implementation, check database
    const mockConsent = {
      id: token,
      purpose,
      granted: true,
      expiresAt: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)) // 1 year from now
    };

    if (mockConsent.expiresAt < new Date()) {
      return {
        valid: false,
        error: 'Consent has expired'
      };
    }

    return {
      valid: true,
      consentId: mockConsent.id,
      purpose: mockConsent.purpose,
      granted: mockConsent.granted,
      expiresAt: mockConsent.expiresAt
    };

  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Withdraw consent
 */
export async function withdrawConsent(
  userId: string, 
  purpose: string, 
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, this would update the consent_records table
    // For now, we'll just log the withdrawal
    
    await logConsentEvent('consent_withdrawn', {
      userId,
      purpose,
      token,
      withdrawnAt: new Date()
    });

    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get user's consent history
 */
export async function getConsentHistory(userId: string): Promise<any[]> {
  // In a real implementation, this would query the consent_records table
  // For now, return mock data
  return [
    {
      id: 'consent_1',
      purpose: 'talent_profile_creation',
      granted: true,
      grantedAt: new Date('2024-01-01'),
      method: 'explicit',
      version: '1.0',
      expiresAt: new Date('2025-01-01')
    },
    {
      id: 'consent_2',
      purpose: 'application_processing',
      granted: true,
      grantedAt: new Date('2024-01-15'),
      method: 'opt_in',
      version: '1.0',
      expiresAt: new Date('2024-07-15')
    }
  ];
}

/**
 * Generate consent token
 */
function generateConsentToken(consentId: string, userId: string, purpose: string): string {
  const payload = {
    consentId,
    userId,
    purpose,
    iat: Math.floor(Date.now() / 1000)
  };

  return crypto
    .createHmac('sha256', process.env.CONSENT_SECRET || 'default-consent-secret')
    .update(JSON.stringify(payload))
    .digest('hex');
}

/**
 * Log consent-related events for audit
 */
async function logConsentEvent(eventType: string, data: any): Promise<void> {
  try {
    // In a real implementation, this would log to the audit_events table
    console.log(`[CONSENT AUDIT] ${eventType}:`, data);
  } catch (error) {
    console.error('Failed to log consent event:', error);
  }
}

/**
 * Check if consent is required for a specific purpose
 */
export function isConsentRequired(purpose: string): boolean {
  const consentRequiredPurposes = [
    'talent_profile_creation',
    'application_processing',
    'media_processing',
    'marketing_communications',
    'analytics_tracking'
  ];

  return consentRequiredPurposes.includes(purpose);
}

/**
 * Get consent requirements for a specific purpose
 */
export function getConsentRequirements(purpose: string): {
  required: boolean;
  legalBasis: string;
  dataCategories: string[];
  retentionPeriod: number;
} {
  const requirements: Record<string, any> = {
    'talent_profile_creation': {
      required: true,
      legalBasis: 'consent',
      dataCategories: ['personal_data', 'biometric_data', 'contact_information'],
      retentionPeriod: 365
    },
    'application_processing': {
      required: true,
      legalBasis: 'consent',
      dataCategories: ['personal_data', 'media_files', 'evaluation_data'],
      retentionPeriod: 180
    },
    'media_processing': {
      required: true,
      legalBasis: 'consent',
      dataCategories: ['media_files', 'metadata'],
      retentionPeriod: 180
    },
    'marketing_communications': {
      required: true,
      legalBasis: 'consent',
      dataCategories: ['contact_information', 'preferences'],
      retentionPeriod: 90
    },
    'analytics_tracking': {
      required: true,
      legalBasis: 'consent',
      dataCategories: ['usage_data', 'device_information'],
      retentionPeriod: 30
    }
  };

  return requirements[purpose] || {
    required: false,
    legalBasis: 'legitimate_interests',
    dataCategories: [],
    retentionPeriod: 0
  };
}
