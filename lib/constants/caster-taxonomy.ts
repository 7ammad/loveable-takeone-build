/**
 * Caster Taxonomy - 23 Types across 7 Categories
 * Based on Saudi Market Research (October 2025)
 */

export interface CasterType {
  label_en: string;
  label_ar: string;
  description: string;
  typical_hiring: string;
  saudi_examples?: string[];
}

export interface CasterCategory {
  label_en: string;
  label_ar: string;
  types: Record<string, CasterType>;
}

export const CASTER_TAXONOMY: Record<string, CasterCategory> = {
  production_companies: {
    label_en: 'Production Companies',
    label_ar: 'شركات الإنتاج',
    types: {
      film_production: {
        label_en: 'Film Production Company',
        label_ar: 'شركة إنتاج أفلام',
        description: 'Feature films, shorts, documentaries',
        typical_hiring: 'Project-based',
        saudi_examples: ['AFLAM Productions', 'Specter Productions', 'Useffilms']
      },
      tv_production: {
        label_en: 'TV Production Company',
        label_ar: 'شركة إنتاج تلفزيوني',
        description: 'TV series, shows, programs',
        typical_hiring: 'Series-based',
        saudi_examples: ['Telfaz11', 'MBC Productions']
      },
      commercial_production: {
        label_en: 'Commercial & Advertising Production',
        label_ar: 'إنتاج إعلانات تجارية',
        description: 'TV commercials, online ads, brand videos',
        typical_hiring: 'Weekly/Monthly',
        saudi_examples: ['PR Media', 'ALMONTAGE', 'Play Media Productions']
      },
      documentary_production: {
        label_en: 'Documentary Production',
        label_ar: 'إنتاج وثائقي',
        description: 'Documentary films, series, educational content',
        typical_hiring: 'Project-based',
        saudi_examples: ['Wahag', 'Filmology']
      },
      animation_studio: {
        label_en: 'Animation Studio',
        label_ar: 'استوديو رسوم متحركة',
        description: 'Animated films, series, digital content',
        typical_hiring: 'Project-based',
        saudi_examples: ['Manga Productions']
      }
    }
  },
  broadcasting_media: {
    label_en: 'Broadcasting & Media',
    label_ar: 'البث والإعلام',
    types: {
      tv_channels: {
        label_en: 'Television Channels',
        label_ar: 'قنوات تلفزيونية',
        description: 'TV networks and channels',
        typical_hiring: 'Regular/Daily',
        saudi_examples: ['MBC Group', 'Rotana Media', 'SBC']
      },
      streaming_platforms: {
        label_en: 'Streaming Platforms',
        label_ar: 'منصات البث',
        description: 'Online streaming services',
        typical_hiring: 'Series-based',
        saudi_examples: ['Shahid', 'STC TV']
      },
      radio_stations: {
        label_en: 'Radio Stations',
        label_ar: 'محطات إذاعية',
        description: 'Radio broadcasting',
        typical_hiring: 'Regular',
        saudi_examples: ['SBC Radio', 'MBC FM', 'Rotana Radio']
      }
    }
  },
  advertising_marketing: {
    label_en: 'Advertising & Marketing',
    label_ar: 'الإعلان والتسويق',
    types: {
      advertising_agency: {
        label_en: 'Advertising Agency',
        label_ar: 'وكالة إعلانية',
        description: 'Full-service advertising',
        typical_hiring: 'Campaign-based',
        saudi_examples: ['Various agencies in Riyadh/Jeddah']
      },
      digital_marketing: {
        label_en: 'Digital Marketing Agency',
        label_ar: 'وكالة تسويق رقمي',
        description: 'Digital and social media marketing',
        typical_hiring: 'Campaign-based'
      },
      influencer_management: {
        label_en: 'Influencer Management',
        label_ar: 'إدارة المؤثرين',
        description: 'Influencer talent management',
        typical_hiring: 'Ongoing'
      }
    }
  },
  events_entertainment: {
    label_en: 'Events & Entertainment',
    label_ar: 'الفعاليات والترفيه',
    types: {
      event_production: {
        label_en: 'Event Production Company',
        label_ar: 'شركة إنتاج فعاليات',
        description: 'Live events, concerts, festivals',
        typical_hiring: 'Event-based',
        saudi_examples: ['Sela (Riyadh Season)', 'Amkenah', 'Deep Vision']
      },
      theater_company: {
        label_en: 'Theater Company',
        label_ar: 'فرقة مسرحية',
        description: 'Stage performances, theatrical productions',
        typical_hiring: 'Show-based',
        saudi_examples: ['Ithra Theater', 'Qiddiya Performing Arts Centre']
      },
      festival_organizer: {
        label_en: 'Festival Organizer',
        label_ar: 'منظم مهرجانات',
        description: 'Cultural and entertainment festivals',
        typical_hiring: 'Seasonal',
        saudi_examples: ['Riyadh Season organizers']
      }
    }
  },
  government_institutions: {
    label_en: 'Government & Institutions',
    label_ar: 'الجهات الحكومية والمؤسسات',
    types: {
      government_ministry: {
        label_en: 'Government Ministry/Authority',
        label_ar: 'وزارة/هيئة حكومية',
        description: 'Government entities producing content',
        typical_hiring: 'Campaign/Project-based',
        saudi_examples: ['Ministry of Culture', 'GEA', 'Ministry of Tourism']
      },
      cultural_institution: {
        label_en: 'Cultural Institution',
        label_ar: 'مؤسسة ثقافية',
        description: 'Cultural centers and organizations',
        typical_hiring: 'Program-based',
        saudi_examples: ['Ithra', 'Diriyah Gate']
      },
      educational_institution: {
        label_en: 'Educational Institution',
        label_ar: 'مؤسسة تعليمية',
        description: 'Universities, schools producing content',
        typical_hiring: 'Project-based'
      }
    }
  },
  talent_services: {
    label_en: 'Talent Agencies & Services',
    label_ar: 'وكالات المواهب والخدمات',
    types: {
      casting_agency: {
        label_en: 'Casting Agency',
        label_ar: 'وكالة اختيار ممثلين',
        description: 'Specialized casting services',
        typical_hiring: 'Project-based',
        saudi_examples: ['Saudi Casting Agency', 'Gulf Casting', 'That Studio', 'Talents Tent']
      },
      talent_management: {
        label_en: 'Talent Management Agency',
        label_ar: 'وكالة إدارة مواهب',
        description: 'Career management and representation',
        typical_hiring: 'Ongoing'
      },
      voice_dubbing: {
        label_en: 'Voice-over & Dubbing Studio',
        label_ar: 'استوديو تعليق صوتي ودبلجة',
        description: 'Voice recording and dubbing services',
        typical_hiring: 'Project-based',
        saudi_examples: ['BiberSA Production', 'DeafCat Studios', 'Saudisoft']
      },
      model_agency: {
        label_en: 'Model Agency',
        label_ar: 'وكالة عارضين',
        description: 'Fashion and commercial modeling',
        typical_hiring: 'Campaign-based'
      }
    }
  },
  corporate: {
    label_en: 'Corporate & In-house',
    label_ar: 'الشركات والفرق الداخلية',
    types: {
      corporate_brand: {
        label_en: 'Corporate Brand (In-house)',
        label_ar: 'علامة تجارية (فريق داخلي)',
        description: 'Companies with internal production teams',
        typical_hiring: 'Campaign-based'
      },
      independent_producer: {
        label_en: 'Independent Producer/Freelancer',
        label_ar: 'منتج مستقل',
        description: 'Individual producers and directors',
        typical_hiring: 'Project-based'
      }
    }
  }
};

// Helper functions for working with the taxonomy
export function getAllCasterTypes(): string[] {
  const types: string[] = [];
  Object.values(CASTER_TAXONOMY).forEach(category => {
    types.push(...Object.keys(category.types));
  });
  return types;
}

export function getAllCategories(): string[] {
  return Object.keys(CASTER_TAXONOMY);
}

export function getCasterTypeInfo(typeKey: string): CasterType | undefined {
  for (const category of Object.values(CASTER_TAXONOMY)) {
    if (category.types[typeKey]) {
      return category.types[typeKey];
    }
  }
  return undefined;
}

export function getCategoryForType(typeKey: string): string | undefined {
  for (const [categoryKey, category] of Object.entries(CASTER_TAXONOMY)) {
    if (category.types[typeKey]) {
      return categoryKey;
    }
  }
  return undefined;
}

export function getTypesForCategory(categoryKey: string): Record<string, CasterType> {
  return CASTER_TAXONOMY[categoryKey]?.types || {};
}

// Company Size Options
export const COMPANY_SIZE_OPTIONS = [
  { value: 'freelance', label_en: 'Freelance', label_ar: 'مستقل' },
  { value: 'small', label_en: 'Small (1-10)', label_ar: 'صغيرة (1-10)' },
  { value: 'medium', label_en: 'Medium (11-50)', label_ar: 'متوسطة (11-50)' },
  { value: 'large', label_en: 'Large (51-200)', label_ar: 'كبيرة (51-200)' },
  { value: 'enterprise', label_en: 'Enterprise (200+)', label_ar: 'مؤسسة (200+)' }
];

// License Authorities
export const LICENSE_AUTHORITIES = [
  { value: 'GCAM', label_en: 'GCAM - Media Commission', label_ar: 'هيئة الإعلام المرئي والمسموع' },
  { value: 'GEA', label_en: 'GEA - Entertainment Authority', label_ar: 'الهيئة العامة للترفيه' },
  { value: 'MOC', label_en: 'MOC - Ministry of Culture', label_ar: 'وزارة الثقافة' }
];

// Compliance Status
export const COMPLIANCE_STATUS = {
  pending: { label_en: 'Pending Verification', label_ar: 'قيد التحقق' },
  verified: { label_en: 'Verified', label_ar: 'موثق' },
  suspended: { label_en: 'Suspended', label_ar: 'معلق' }
};

// Team Member Permissions
export const TEAM_PERMISSIONS = {
  view_applications: { label_en: 'View Applications', label_ar: 'عرض الطلبات' },
  edit_jobs: { label_en: 'Edit Casting Calls', label_ar: 'تعديل إعلانات التمثيل' },
  manage_team: { label_en: 'Manage Team Members', label_ar: 'إدارة أعضاء الفريق' },
  post_jobs: { label_en: 'Create Casting Calls', label_ar: 'إنشاء إعلانات تمثيل' },
  manage_bookings: { label_en: 'Schedule Auditions', label_ar: 'جدولة الاختبارات' },
  view_analytics: { label_en: 'View Analytics', label_ar: 'عرض التحليلات' }
};

