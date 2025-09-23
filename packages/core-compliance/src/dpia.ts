export interface DpiaAssessment {
  id: string;
  processingActivity: string;
  assessmentDate: Date;
  assessor: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  risksIdentified: string[];
  mitigationMeasures: string[];
  residualRisk: 'low' | 'medium' | 'high' | 'critical';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  reviewDate: Date; // When to review the DPIA
  notes: string;
}

export interface DpiaChecklistItem {
  category: string;
  question: string;
  answer: boolean;
  notes: string;
}

/**
 * DPIA Checklist categories based on GDPR Article 35
 */
export const DPIA_CHECKLIST = [
  {
    category: 'Data Processing Nature',
    questions: [
      'Does the processing involve a systematic and extensive evaluation of personal aspects?',
      'Does the processing involve sensitive data or data concerning vulnerable individuals?',
      'Does the processing involve large scale processing of data?',
      'Does the processing involve matching or combining datasets?',
      'Does the processing involve data concerning vulnerable individuals (children, minorities)?',
    ],
  },
  {
    category: 'Potential Risks',
    questions: [
      'Could the processing result in physical harm or psychological distress?',
      'Could the processing result in social or economic disadvantage?',
      'Could the processing result in identity theft or fraud?',
      'Could the processing result in reputational damage?',
      'Could the processing result in loss of confidentiality?',
    ],
  },
  {
    category: 'Data Protection Measures',
    questions: [
      'Are appropriate technical measures in place (encryption, pseudonymization)?',
      'Are appropriate organizational measures in place (policies, training)?',
      'Is data minimization principle applied?',
      'Is purpose limitation principle applied?',
      'Is storage limitation principle applied?',
    ],
  },
];

/**
 * Create a new DPIA assessment
 */
export function createDpiaAssessment(
  processingActivity: string,
  assessor: string,
  risks: string[],
  mitigations: string[]
): DpiaAssessment {
  // Determine risk level based on risks and mitigations
  const riskLevel = assessRiskLevel(risks, mitigations);

  return {
    id: `dpia-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    processingActivity,
    assessmentDate: new Date(),
    assessor,
    riskLevel,
    risksIdentified: risks,
    mitigationMeasures: mitigations,
    residualRisk: riskLevel, // Simplified - in practice would be re-assessed after mitigations
    approvalStatus: 'pending',
    reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year review
    notes: '',
  };
}

/**
 * Assess risk level based on identified risks and mitigations
 */
function assessRiskLevel(risks: string[], mitigations: string[]): DpiaAssessment['riskLevel'] {
  const riskCount = risks.length;
  const mitigationCount = mitigations.length;

  if (riskCount === 0) return 'low';
  if (riskCount <= 2 && mitigationCount >= riskCount) return 'low';
  if (riskCount <= 4 && mitigationCount >= riskCount) return 'medium';
  if (riskCount > 4 || mitigationCount < riskCount / 2) return 'high';

  return 'critical';
}

/**
 * Approve a DPIA assessment
 */
export function approveDpiaAssessment(
  assessment: DpiaAssessment,
  approver: string
): DpiaAssessment {
  return {
    ...assessment,
    approvalStatus: 'approved',
    approvedBy: approver,
    approvedAt: new Date(),
  };
}

/**
 * Check if a processing activity requires DPIA
 */
export async function requiresDpiaAssessment(activityName: string): Promise<boolean> {
  // First check RoPA for DPIA requirement
  const { requiresDpia } = await import('./ropa');
  return await requiresDpia(activityName);
}

/**
 * Get DPIA review schedule
 */
export function getDpiaReviewSchedule(): { activity: string; nextReview: Date }[] {
  // In a real implementation, this would query the database
  return [
    {
      activity: 'Talent Profile Management',
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    {
      activity: 'Payment Processing',
      nextReview: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    },
    {
      activity: 'Guardian Consent Management',
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    },
  ];
}

/**
 * Generate DPIA report
 */
export function generateDpiaReport(assessment: DpiaAssessment): string {
  return `
# Data Protection Impact Assessment Report

## Assessment Details
- **ID**: ${assessment.id}
- **Processing Activity**: ${assessment.processingActivity}
- **Assessment Date**: ${assessment.assessmentDate.toISOString()}
- **Assessor**: ${assessment.assessor}
- **Risk Level**: ${assessment.riskLevel.toUpperCase()}
- **Status**: ${assessment.approvalStatus}

## Risks Identified
${assessment.risksIdentified.map(risk => `- ${risk}`).join('\n')}

## Mitigation Measures
${assessment.mitigationMeasures.map(measure => `- ${measure}`).join('\n')}

## Residual Risk
${assessment.residualRisk.toUpperCase()}

## Approval
${assessment.approvedBy ? `- Approved by: ${assessment.approvedBy} on ${assessment.approvedAt?.toISOString()}` : '- Not yet approved'}

## Next Review Date
${assessment.reviewDate.toISOString()}

## Notes
${assessment.notes || 'No additional notes'}
  `.trim();
}
