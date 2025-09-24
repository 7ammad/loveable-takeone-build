import { z } from 'zod';

// Search filter schemas
export const SearchFiltersSchema = z.object({
  // Basic filters
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  experience: z.number().int().min(0).max(50).optional(),
  minExperience: z.number().int().min(0).max(50).optional(),
  maxExperience: z.number().int().min(0).max(50).optional(),
  
  // Advanced filters
  specializations: z.array(z.string()).optional(),
  awards: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  
  // Demographics
  ageRange: z.object({
    min: z.number().int().min(0).max(100).optional(),
    max: z.number().int().min(0).max(100).optional(),
  }).optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'other']).optional(),
  ethnicity: z.array(z.string()).optional(),
  
  // Physical attributes
  heightRange: z.object({
    min: z.number().int().min(100).max(250).optional(), // cm
    max: z.number().int().min(100).max(250).optional(),
  }).optional(),
  weightRange: z.object({
    min: z.number().int().min(30).max(200).optional(), // kg
    max: z.number().int().min(30).max(200).optional(),
  }).optional(),
  eyeColor: z.array(z.string()).optional(),
  hairColor: z.array(z.string()).optional(),
  bodyType: z.array(z.string()).optional(),
  
  // Professional attributes
  verified: z.boolean().optional(),
  isMinor: z.boolean().optional(),
  availability: z.enum(['available', 'busy', 'unavailable']).optional(),
  availabilityStatus: z.enum(['available', 'busy', 'unavailable']).optional(),
  
  // Performance attributes
  voiceType: z.array(z.string()).optional(),
  danceStyles: z.array(z.string()).optional(),
  instruments: z.array(z.string()).optional(),
  specialSkills: z.array(z.string()).optional(),
  
  // Union and representation
  unionMemberships: z.array(z.string()).optional(),
  hasAgent: z.boolean().optional(),
  hasManager: z.boolean().optional(),
  
  // Work preferences
  travelWillingness: z.boolean().optional(),
  remoteWork: z.boolean().optional(),
  rateRange: z.object({
    min: z.number().int().min(0).optional(),
    max: z.number().int().min(0).optional(),
    currency: z.string().default('SAR').optional(),
  }).optional(),
  
  // Geographic filters
  locationCoords: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  radius: z.number().int().min(1).max(1000).default(50).optional(), // km
  
  // Date filters
  createdAt: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).optional(),
  updatedAt: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).optional(),
  
  // Search quality
  searchQuality: z.enum(['high', 'medium', 'low']).optional(),
  hasProfileImage: z.boolean().optional(),
  hasDemoReel: z.boolean().optional(),
  hasResume: z.boolean().optional(),
  
  // Social media presence
  hasInstagram: z.boolean().optional(),
  hasTwitter: z.boolean().optional(),
  hasTikTok: z.boolean().optional(),
  hasYouTube: z.boolean().optional(),
  
  // Previous work
  hasPreviousWork: z.boolean().optional(),
  previousWorkCount: z.object({
    min: z.number().int().min(0).optional(),
    max: z.number().int().min(0).optional(),
  }).optional(),
  
  // Training
  hasTraining: z.boolean().optional(),
  trainingInstitutions: z.array(z.string()).optional(),
  
  // Language proficiency
  languageProficiency: z.object({
    language: z.string(),
    proficiency: z.enum(['native', 'fluent', 'conversational', 'basic']),
  }).array().optional(),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

// Predefined filter sets for common searches
export const COMMON_FILTERS: {
  ACTORS: Partial<SearchFilters>;
  DIRECTORS: Partial<SearchFilters>;
  PRODUCERS: Partial<SearchFilters>;
  WRITERS: Partial<SearchFilters>;
  MINORS: Partial<SearchFilters>;
  VERIFIED_TALENT: Partial<SearchFilters>;
  LOCAL_TALENT: (city: string) => Partial<SearchFilters>;
  EXPERIENCED_TALENT: (minExperience: number) => Partial<SearchFilters>;
} = {
  ACTORS: {
    skills: ['acting', 'drama', 'theater'],
    specializations: ['film', 'television', 'theater'],
    availability: 'available',
  },
  DIRECTORS: {
    skills: ['directing', 'filmmaking'],
    specializations: ['film', 'television', 'commercial'],
    availability: 'available',
  },
  PRODUCERS: {
    skills: ['producing', 'project management'],
    specializations: ['film', 'television', 'commercial'],
    availability: 'available',
  },
  WRITERS: {
    skills: ['writing', 'screenwriting', 'scriptwriting'],
    specializations: ['film', 'television', 'theater'],
    availability: 'available',
  },
  MINORS: {
    isMinor: true,
    availability: 'available',
  },
  VERIFIED_TALENT: {
    verified: true,
    availability: 'available',
  },
  LOCAL_TALENT: (city: string) => ({
    city,
    availability: 'available',
  }),
  EXPERIENCED_TALENT: (minExperience: number) => ({
    minExperience,
    availability: 'available',
  }),
};

// Filter validation and sanitization
export class SearchFilterValidator {
  /**
   * Validate and sanitize search filters
   */
  static validateFilters(filters: any): SearchFilters {
    const result = SearchFiltersSchema.safeParse(filters);
    
    if (!result.success) {
      throw new Error(`Invalid search filters: ${result.error.message}`);
    }
    
    return result.data;
  }

  /**
   * Apply common filter presets
   */
  static applyPreset(filters: SearchFilters, preset: keyof typeof COMMON_FILTERS, ...args: string[]): SearchFilters {
    const presetFilters = COMMON_FILTERS[preset];

    if (typeof presetFilters === 'function') {
      // Type assertion to handle the function call
      const result = (presetFilters as (...args: string[]) => SearchFilters)(...args);
      return {
        ...filters,
        ...result,
        // Force readonly arrays to mutable
        skills: result.skills?.slice(),
        specializations: result.specializations?.slice(),
      };
    }

    return {
      ...filters,
      ...presetFilters,
      // Force readonly arrays to mutable
      skills: presetFilters.skills?.slice(),
      specializations: presetFilters.specializations?.slice(),
    };
  }

  /**
   * Build Algolia filter string from search filters
   */
  static buildAlgoliaFilters(filters: SearchFilters): string {
    const filterParts: string[] = [];

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      filterParts.push(`skills:${filters.skills.join(' OR skills:')}`);
    }

    // Languages filter
    if (filters.languages && filters.languages.length > 0) {
      filterParts.push(`languages:${filters.languages.join(' OR languages:')}`);
    }

    // Location filter
    if (filters.location) {
      filterParts.push(`location:"${filters.location}"`);
    }

    // City filter
    if (filters.city) {
      filterParts.push(`city:"${filters.city}"`);
    }

    // Experience filter
    if (filters.experience !== undefined) {
      filterParts.push(`experience:${filters.experience}`);
    }

    // Min/Max experience filters
    if (filters.minExperience !== undefined) {
      filterParts.push(`experience >= ${filters.minExperience}`);
    }
    if (filters.maxExperience !== undefined) {
      filterParts.push(`experience <= ${filters.maxExperience}`);
    }

    // Specializations filter
    if (filters.specializations && filters.specializations.length > 0) {
      filterParts.push(`specializations:${filters.specializations.join(' OR specializations:')}`);
    }

    // Demographics
    if (filters.gender) {
      filterParts.push(`gender:"${filters.gender}"`);
    }

    if (filters.ethnicity && filters.ethnicity.length > 0) {
      filterParts.push(`ethnicity:${filters.ethnicity.join(' OR ethnicity:')}`);
    }

    // Age range
    if (filters.ageRange) {
      if (filters.ageRange.min !== undefined) {
        filterParts.push(`age >= ${filters.ageRange.min}`);
      }
      if (filters.ageRange.max !== undefined) {
        filterParts.push(`age <= ${filters.ageRange.max}`);
      }
    }

    // Physical attributes
    if (filters.heightRange) {
      if (filters.heightRange.min !== undefined) {
        filterParts.push(`height >= ${filters.heightRange.min}`);
      }
      if (filters.heightRange.max !== undefined) {
        filterParts.push(`height <= ${filters.heightRange.max}`);
      }
    }

    if (filters.weightRange) {
      if (filters.weightRange.min !== undefined) {
        filterParts.push(`weight >= ${filters.weightRange.min}`);
      }
      if (filters.weightRange.max !== undefined) {
        filterParts.push(`weight <= ${filters.weightRange.max}`);
      }
    }

    if (filters.eyeColor && filters.eyeColor.length > 0) {
      filterParts.push(`eyeColor:${filters.eyeColor.join(' OR eyeColor:')}`);
    }

    if (filters.hairColor && filters.hairColor.length > 0) {
      filterParts.push(`hairColor:${filters.hairColor.join(' OR hairColor:')}`);
    }

    if (filters.bodyType && filters.bodyType.length > 0) {
      filterParts.push(`bodyType:${filters.bodyType.join(' OR bodyType:')}`);
    }

    // Professional attributes
    if (filters.verified !== undefined) {
      filterParts.push(`verified:${filters.verified}`);
    }

    if (filters.isMinor !== undefined) {
      filterParts.push(`isMinor:${filters.isMinor}`);
    }

    if (filters.availability) {
      filterParts.push(`availability:"${filters.availability}"`);
    }

    if (filters.availabilityStatus) {
      filterParts.push(`availabilityStatus:"${filters.availabilityStatus}"`);
    }

    // Performance attributes
    if (filters.voiceType && filters.voiceType.length > 0) {
      filterParts.push(`voiceType:${filters.voiceType.join(' OR voiceType:')}`);
    }

    if (filters.danceStyles && filters.danceStyles.length > 0) {
      filterParts.push(`danceStyles:${filters.danceStyles.join(' OR danceStyles:')}`);
    }

    if (filters.instruments && filters.instruments.length > 0) {
      filterParts.push(`instruments:${filters.instruments.join(' OR instruments:')}`);
    }

    if (filters.specialSkills && filters.specialSkills.length > 0) {
      filterParts.push(`specialSkills:${filters.specialSkills.join(' OR specialSkills:')}`);
    }

    // Union and representation
    if (filters.unionMemberships && filters.unionMemberships.length > 0) {
      filterParts.push(`unionMemberships:${filters.unionMemberships.join(' OR unionMemberships:')}`);
    }

    if (filters.hasAgent !== undefined) {
      filterParts.push(`agent:${filters.hasAgent ? 'NOT NULL' : 'NULL'}`);
    }

    if (filters.hasManager !== undefined) {
      filterParts.push(`manager:${filters.hasManager ? 'NOT NULL' : 'NULL'}`);
    }

    // Work preferences
    if (filters.travelWillingness !== undefined) {
      filterParts.push(`travelWillingness:${filters.travelWillingness}`);
    }

    if (filters.remoteWork !== undefined) {
      filterParts.push(`remoteWork:${filters.remoteWork}`);
    }

    // Rate range
    if (filters.rateRange) {
      if (filters.rateRange.min !== undefined) {
        filterParts.push(`rateRange.min >= ${filters.rateRange.min}`);
      }
      if (filters.rateRange.max !== undefined) {
        filterParts.push(`rateRange.max <= ${filters.rateRange.max}`);
      }
    }

    // Search quality
    if (filters.searchQuality) {
      filterParts.push(`searchQuality:"${filters.searchQuality}"`);
    }

    if (filters.hasProfileImage !== undefined) {
      filterParts.push(`profileImage:${filters.hasProfileImage ? 'NOT NULL' : 'NULL'}`);
    }

    if (filters.hasDemoReel !== undefined) {
      filterParts.push(`demoReel:${filters.hasDemoReel ? 'NOT NULL' : 'NULL'}`);
    }

    if (filters.hasResume !== undefined) {
      filterParts.push(`resume:${filters.hasResume ? 'NOT NULL' : 'NULL'}`);
    }

    // Social media presence
    if (filters.hasInstagram !== undefined) {
      filterParts.push(`socialMedia.instagram:${filters.hasInstagram ? 'NOT NULL' : 'NULL'}`);
    }

    if (filters.hasTwitter !== undefined) {
      filterParts.push(`socialMedia.twitter:${filters.hasTwitter ? 'NOT NULL' : 'NULL'}`);
    }

    if (filters.hasTikTok !== undefined) {
      filterParts.push(`socialMedia.tiktok:${filters.hasTikTok ? 'NOT NULL' : 'NULL'}`);
    }

    if (filters.hasYouTube !== undefined) {
      filterParts.push(`socialMedia.youtube:${filters.hasYouTube ? 'NOT NULL' : 'NULL'}`);
    }

    // Previous work
    if (filters.hasPreviousWork !== undefined) {
      filterParts.push(`previousWork:${filters.hasPreviousWork ? 'NOT NULL' : 'NULL'}`);
    }

    if (filters.previousWorkCount) {
      if (filters.previousWorkCount.min !== undefined) {
        filterParts.push(`previousWorkCount >= ${filters.previousWorkCount.min}`);
      }
      if (filters.previousWorkCount.max !== undefined) {
        filterParts.push(`previousWorkCount <= ${filters.previousWorkCount.max}`);
      }
    }

    // Training
    if (filters.hasTraining !== undefined) {
      filterParts.push(`training:${filters.hasTraining ? 'NOT NULL' : 'NULL'}`);
    }

    if (filters.trainingInstitutions && filters.trainingInstitutions.length > 0) {
      filterParts.push(`trainingInstitutions:${filters.trainingInstitutions.join(' OR trainingInstitutions:')}`);
    }

    return filterParts.join(' AND ');
  }

  /**
   * Build Algolia facet filters from search filters
   */
  static buildAlgoliaFacetFilters(filters: SearchFilters): Array<string | string[]> {
    const facetFilters: Array<string | string[]> = [];

    // Skills facets
    if (filters.skills?.length) {
      facetFilters.push(...filters.skills.map(skill => `skills:${skill}`));
    }

    // Languages facets
    if (filters.languages?.length) {
      facetFilters.push(...filters.languages.map(lang => `languages:${lang}`));
    }

    // Specializations facets
    if (filters.specializations?.length) {
      facetFilters.push(...filters.specializations.map(spec => `specializations:${spec}`));
    }

    // Ethnicity facets
    if (filters.ethnicity?.length) {
      facetFilters.push(...filters.ethnicity.map(eth => `ethnicity:${eth}`));
    }

    // Eye color facets
    if (filters.eyeColor?.length) {
      facetFilters.push(...filters.eyeColor.map(color => `eyeColor:${color}`));
    }

    // Hair color facets
    if (filters.hairColor?.length) {
      facetFilters.push(...filters.hairColor.map(color => `hairColor:${color}`));
    }

    // Body type facets
    if (filters.bodyType?.length) {
      facetFilters.push(...filters.bodyType.map(type => `bodyType:${type}`));
    }

    // Voice type facets
    if (filters.voiceType?.length) {
      facetFilters.push(...filters.voiceType.map(type => `voiceType:${type}`));
    }

    // Dance styles facets
    if (filters.danceStyles?.length) {
      facetFilters.push(...filters.danceStyles.map(style => `danceStyles:${style}`));
    }

    // Instruments facets
    if (filters.instruments?.length) {
      facetFilters.push(...filters.instruments.map(instrument => `instruments:${instrument}`));
    }

    // Special skills facets
    if (filters.specialSkills?.length) {
      facetFilters.push(...filters.specialSkills.map(skill => `specialSkills:${skill}`));
    }

    // Union memberships facets
    if (filters.unionMemberships?.length) {
      facetFilters.push(...filters.unionMemberships.map(union => `unionMemberships:${union}`));
    }

    // Training institutions facets
    if (filters.trainingInstitutions?.length) {
      facetFilters.push(...filters.trainingInstitutions.map(institution => `trainingInstitutions:${institution}`));
    }

    return facetFilters;
  }

  /**
   * Build Algolia numeric filters from search filters
   */
  static buildAlgoliaNumericFilters(filters: SearchFilters): string[] {
    const numericFilters: string[] = [];

    // Experience filters
    if (filters.minExperience !== undefined) {
      numericFilters.push(`experience >= ${filters.minExperience}`);
    }
    if (filters.maxExperience !== undefined) {
      numericFilters.push(`experience <= ${filters.maxExperience}`);
    }

    // Age range filters
    if (filters.ageRange) {
      if (filters.ageRange.min !== undefined) {
        numericFilters.push(`age >= ${filters.ageRange.min}`);
      }
      if (filters.ageRange.max !== undefined) {
        numericFilters.push(`age <= ${filters.ageRange.max}`);
      }
    }

    // Height range filters
    if (filters.heightRange) {
      if (filters.heightRange.min !== undefined) {
        numericFilters.push(`height >= ${filters.heightRange.min}`);
      }
      if (filters.heightRange.max !== undefined) {
        numericFilters.push(`height <= ${filters.heightRange.max}`);
      }
    }

    // Weight range filters
    if (filters.weightRange) {
      if (filters.weightRange.min !== undefined) {
        numericFilters.push(`weight >= ${filters.weightRange.min}`);
      }
      if (filters.weightRange.max !== undefined) {
        numericFilters.push(`weight <= ${filters.weightRange.max}`);
      }
    }

    // Rate range filters
    if (filters.rateRange) {
      if (filters.rateRange.min !== undefined) {
        numericFilters.push(`rateRange.min >= ${filters.rateRange.min}`);
      }
      if (filters.rateRange.max !== undefined) {
        numericFilters.push(`rateRange.max <= ${filters.rateRange.max}`);
      }
    }

    // Previous work count filters
    if (filters.previousWorkCount) {
      if (filters.previousWorkCount.min !== undefined) {
        numericFilters.push(`previousWorkCount >= ${filters.previousWorkCount.min}`);
      }
      if (filters.previousWorkCount.max !== undefined) {
        numericFilters.push(`previousWorkCount <= ${filters.previousWorkCount.max}`);
      }
    }

    return numericFilters;
  }
}
