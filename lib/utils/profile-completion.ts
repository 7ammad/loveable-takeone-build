import { ProfileCompletionStep } from '@/components/ui/profile-completion';
import { TalentProfile, CasterProfile } from '@/lib/types';

/**
 * Calculate profile completion percentage and steps for Talent users
 */
export function calculateTalentProfileCompletion(profile: TalentProfile | null): {
  percentage: number;
  steps: ProfileCompletionStep[];
} {
  const steps: ProfileCompletionStep[] = [
    {
      id: 'basic-info',
      label: 'Complete basic information',
      completed: !!(profile?.stageName && profile?.dateOfBirth && profile?.gender && profile?.city),
      href: '/profile/edit',
      priority: 'critical',
    },
    {
      id: 'physical-attributes',
      label: 'Add physical attributes',
      completed: !!(profile?.height && profile?.eyeColor && profile?.hairColor),
      href: '/profile/edit',
      priority: 'important',
    },
    {
      id: 'skills',
      label: 'List your skills and languages',
      completed: !!((profile?.skills?.length || 0) > 0 && (profile?.languages?.length || 0) > 0),
      href: '/profile/edit',
      priority: 'critical',
    },
    {
      id: 'portfolio',
      label: 'Upload demo reel or portfolio',
      completed: !!(profile?.demoReelUrl || profile?.portfolioUrl),
      href: '/profile/edit',
      priority: 'critical',
    },
    {
      id: 'social',
      label: 'Connect social media',
      completed: !!profile?.instagramUrl,
      href: '/profile/edit',
      priority: 'optional',
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;
  const percentage = Math.round((completedSteps / steps.length) * 100);

  return { percentage, steps };
}

/**
 * Calculate profile completion percentage and steps for Caster users
 */
export function calculateCasterProfileCompletion(profile: CasterProfile | null): {
  percentage: number;
  steps: ProfileCompletionStep[];
} {
  const steps: ProfileCompletionStep[] = [
    {
      id: 'company-info',
      label: 'Complete company information',
      completed: !!(profile?.companyName && profile?.companyType && profile?.city),
      href: '/profile/edit',
      priority: 'critical',
    },
    {
      id: 'business-details',
      label: 'Add business contact details',
      completed: !!(profile?.businessPhone && profile?.businessEmail),
      href: '/profile/edit',
      priority: 'critical',
    },
    {
      id: 'verification',
      label: 'Submit verification documents',
      completed: !!profile?.commercialRegistration,
      href: '/profile/edit',
      priority: 'important',
    },
    {
      id: 'specializations',
      label: 'Add your specializations',
      completed: !!((profile?.specializations?.length || 0) > 0),
      href: '/profile/edit',
      priority: 'important',
    },
    {
      id: 'website',
      label: 'Add your company website',
      completed: !!profile?.website,
      href: '/profile/edit',
      priority: 'optional',
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;
  const percentage = Math.round((completedSteps / steps.length) * 100);

  return { percentage, steps };
}

