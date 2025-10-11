import { z } from 'zod';

export interface TalentProfile {
  id: string;
  name: string;
  bio: string;
  skills: string[];
  languages: string[];
  location: string;
  city: string;
  experience: number;
  specializations: string[];
  awards: string[];
  education: string[];
  profileImage?: string;
  verified: boolean;
  isMinor: boolean;
  availability: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional ranking factors
  searchableText: string;
  completeness: number; // Profile completeness score (0-1)
  locationCoords?: {
    lat: number;
    lng: number;
  };
  age?: number;
  gender?: string;
  ethnicity?: string;
  height?: number;
  weight?: number;
  eyeColor?: string;
  hairColor?: string;
  bodyType?: string;
  voiceType?: string;
  danceStyles?: string[];
  instruments?: string[];
  specialSkills?: string[];
  unionMemberships?: string[];
  agent?: string;
  manager?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  demoReel?: string;
  headshots?: string[];
  resume?: string;
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  travelWillingness: boolean;
  remoteWork: boolean;
  rateRange?: {
    min: number;
    max: number;
    currency: string;
  };
  previousWork?: {
    title: string;
    role: string;
    year: number;
    director?: string;
    production?: string;
  }[];
  training?: {
    institution: string;
    program: string;
    year: number;
    certificate?: string;
  }[];
  languagesSpoken?: {
    language: string;
    proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
  }[];
}

export interface SearchContext {
  userId?: string;
  searchTerm: string;
  filters?: Record<string, any>;
  location?: {
    lat: number;
    lng: number;
  };
  userPreferences?: {
    preferredSkills?: string[];
    preferredLocations?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'professional' | 'expert';
    ageRange?: {
      min: number;
      max: number;
    };
    gender?: string;
    verifiedOnly?: boolean;
  };
  searchHistory?: {
    recentSearches: string[];
    clickedProfiles: string[];
    savedProfiles: string[];
  };
}

export interface RankingFactors {
  relevance: number;        // 0-1, how well the profile matches the search term
  experience: number;       // 0-1, based on years of experience
  verification: number;     // 0-1, verified profiles get higher score
  completeness: number;     // 0-1, how complete the profile is
  recency: number;          // 0-1, newer profiles get slight boost
  location: number;         // 0-1, proximity to search location
  popularity: number;       // 0-1, based on profile views and interactions
  diversity: number;        // 0-1, ensures diverse results
  quality: number;          // 0-1, based on profile quality indicators
  personalization: number;  // 0-1, based on user preferences and history
}

export interface RankingWeights {
  relevance: number;
  experience: number;
  verification: number;
  completeness: number;
  recency: number;
  location: number;
  popularity: number;
  diversity: number;
  quality: number;
  personalization: number;
}

export class SearchRankingEngine {
  private defaultWeights: RankingWeights = {
    relevance: 0.25,
    experience: 0.15,
    verification: 0.10,
    completeness: 0.10,
    recency: 0.05,
    location: 0.10,
    popularity: 0.10,
    diversity: 0.05,
    quality: 0.05,
    personalization: 0.05
  };

  /**
   * Calculate ranking factors for a talent profile
   */
  calculateRankingFactors(profile: TalentProfile, context: SearchContext): RankingFactors {
    return {
      relevance: this.calculateRelevance(profile, context),
      experience: this.calculateExperienceScore(profile),
      verification: this.calculateVerificationScore(profile),
      completeness: this.calculateCompletenessScore(profile),
      recency: this.calculateRecencyScore(profile),
      location: this.calculateLocationScore(profile, context),
      popularity: this.calculatePopularityScore(profile),
      diversity: this.calculateDiversityScore(profile, context),
      quality: this.calculateQualityScore(profile),
      personalization: this.calculatePersonalizationScore(profile, context)
    };
  }

  /**
   * Calculate final ranking score
   */
  calculateRankingScore(factors: RankingFactors, weights: RankingWeights = this.defaultWeights): number {
    let score = 0;
    
    for (const [factor, value] of Object.entries(factors)) {
      score += value * (weights[factor as keyof RankingWeights] || 0);
    }
    
    return Math.min(1, Math.max(0, score)); // Clamp between 0 and 1
  }

  /**
   * Calculate relevance score based on search term matching
   */
  private calculateRelevance(profile: TalentProfile, context: SearchContext): number {
    const searchTerm = context.searchTerm.toLowerCase();
    if (!searchTerm) return 0.5; // Neutral score for empty search

    const searchableText = profile.searchableText.toLowerCase();
    const words = searchTerm.split(/\s+/);
    
    let matchScore = 0;
    const totalWords = words.length;

    for (const word of words) {
      if (searchableText.includes(word)) {
        matchScore += 1;
      }
    }

    // Boost for exact phrase matches
    if (searchableText.includes(searchTerm)) {
      matchScore += 2;
    }

    // Boost for skill matches
    const skillMatches = profile.skills.filter(skill => 
      skill.toLowerCase().includes(searchTerm)
    ).length;
    matchScore += skillMatches * 0.5;

    // Boost for specialization matches
    const specializationMatches = profile.specializations.filter(spec => 
      spec.toLowerCase().includes(searchTerm)
    ).length;
    matchScore += specializationMatches * 0.3;

    return Math.min(1, matchScore / (totalWords + 2));
  }

  /**
   * Calculate experience score based on years of experience
   */
  private calculateExperienceScore(profile: TalentProfile): number {
    const experience = profile.experience || 0;
    
    // Normalize experience score (0-50 years)
    if (experience >= 20) return 1.0;
    if (experience >= 10) return 0.8;
    if (experience >= 5) return 0.6;
    if (experience >= 2) return 0.4;
    if (experience >= 1) return 0.2;
    return 0.1;
  }

  /**
   * Calculate verification score
   */
  private calculateVerificationScore(profile: TalentProfile): number {
    let score = 0;
    
    if (profile.verified) score += 0.5;
    if (profile.agent) score += 0.2;
    if (profile.manager) score += 0.2;
    if (profile.unionMemberships && profile.unionMemberships.length > 0) score += 0.1;
    
    return Math.min(1, score);
  }

  /**
   * Calculate profile completeness score
   */
  private calculateCompletenessScore(profile: TalentProfile): number {
    let score = 0;
    let totalFields = 0;

    // Basic profile fields
    const basicFields = [
      'name', 'bio', 'skills', 'languages', 'location', 'city', 'experience',
      'specializations', 'profileImage', 'availability'
    ];

    for (const field of basicFields) {
      totalFields++;
      if (profile[field as keyof TalentProfile]) {
        score += 1;
      }
    }

    // Additional profile fields
    const additionalFields = [
      'awards', 'education', 'demoReel', 'headshots', 'resume', 'website',
      'socialMedia', 'previousWork', 'training'
    ];

    for (const field of additionalFields) {
      totalFields++;
      const value = profile[field as keyof TalentProfile];
      if (value && (Array.isArray(value) ? value.length > 0 : value)) {
        score += 1;
      }
    }

    return score / totalFields;
  }

  /**
   * Calculate recency score (newer profiles get slight boost)
   */
  private calculateRecencyScore(profile: TalentProfile): number {
    const now = new Date();
    const createdAt = new Date(profile.createdAt);
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Boost for profiles created in the last 30 days
    if (daysSinceCreation <= 30) return 1.0;
    if (daysSinceCreation <= 90) return 0.8;
    if (daysSinceCreation <= 180) return 0.6;
    if (daysSinceCreation <= 365) return 0.4;
    return 0.2;
  }

  /**
   * Calculate location score based on proximity
   */
  private calculateLocationScore(profile: TalentProfile, context: SearchContext): number {
    if (!context.location || !profile.locationCoords) return 0.5;

    const distance = this.calculateDistance(
      context.location.lat,
      context.location.lng,
      profile.locationCoords.lat,
      profile.locationCoords.lng
    );

    // Score based on distance (in km)
    if (distance <= 10) return 1.0;
    if (distance <= 25) return 0.8;
    if (distance <= 50) return 0.6;
    if (distance <= 100) return 0.4;
    if (distance <= 200) return 0.2;
    return 0.1;
  }

  /**
   * Calculate popularity score (mock implementation)
   */
  private calculatePopularityScore(profile: TalentProfile): number {
    // In a real implementation, this would be based on:
    // - Profile views
    // - Application clicks
    // - Saved searches
    // - Social media followers
    
    let score = 0;
    
    // Mock popularity based on profile completeness and verification
    score += profile.verified ? 0.3 : 0;
    score += profile.completeness * 0.2;
    score += (profile.socialMedia && Object.keys(profile.socialMedia).length > 0) ? 0.2 : 0;
    score += (profile.previousWork && profile.previousWork.length > 0) ? 0.3 : 0;
    
    return Math.min(1, score);
  }

  /**
   * Calculate diversity score to ensure varied results
   */
  private calculateDiversityScore(profile: TalentProfile, context: SearchContext): number {
    // This would be calculated based on the current result set
    // to ensure diversity in gender, ethnicity, location, etc.
    // For now, return a neutral score
    return 0.5;
  }

  /**
   * Calculate quality score based on profile quality indicators
   */
  private calculateQualityScore(profile: TalentProfile): number {
    let score = 0;
    
    // High-quality profile indicators
    if (profile.demoReel) score += 0.2;
    if (profile.headshots && profile.headshots.length > 0) score += 0.2;
    if (profile.resume) score += 0.2;
    if (profile.website) score += 0.1;
    if (profile.awards && profile.awards.length > 0) score += 0.1;
    if (profile.training && profile.training.length > 0) score += 0.1;
    if (profile.previousWork && profile.previousWork.length > 0) score += 0.1;
    
    return Math.min(1, score);
  }

  /**
   * Calculate personalization score based on user preferences and history
   */
  private calculatePersonalizationScore(profile: TalentProfile, context: SearchContext): number {
    if (!context.userPreferences && !context.searchHistory) return 0.5;

    let score = 0;
    let factors = 0;

    // User preferences
    if (context.userPreferences) {
      const prefs = context.userPreferences;
      
      if (prefs.preferredSkills) {
        const skillMatches = profile.skills.filter(skill => 
          prefs.preferredSkills!.includes(skill)
        ).length;
        score += (skillMatches / prefs.preferredSkills.length) * 0.3;
        factors++;
      }
      
      if (prefs.preferredLocations) {
        const locationMatches = prefs.preferredLocations.some(loc => 
          profile.location.toLowerCase().includes(loc.toLowerCase()) ||
          profile.city.toLowerCase().includes(loc.toLowerCase())
        );
        score += locationMatches ? 0.2 : 0;
        factors++;
      }
      
      if (prefs.experienceLevel) {
        const experienceLevel = this.getExperienceLevel(profile.experience);
        score += experienceLevel === prefs.experienceLevel ? 0.2 : 0;
        factors++;
      }
      
      if (prefs.gender && profile.gender) {
        score += profile.gender === prefs.gender ? 0.1 : 0;
        factors++;
      }
      
      if (prefs.verifiedOnly && profile.verified) {
        score += 0.2;
        factors++;
      }
    }

    // Search history
    if (context.searchHistory) {
      const history = context.searchHistory;
      
      if (history.clickedProfiles.includes(profile.id)) {
        score += 0.3;
        factors++;
      }
      
      if (history.savedProfiles.includes(profile.id)) {
        score += 0.4;
        factors++;
      }
    }

    return factors > 0 ? score / factors : 0.5;
  }

  /**
   * Get experience level category
   */
  private getExperienceLevel(experience: number): 'beginner' | 'intermediate' | 'professional' | 'expert' {
    if (experience >= 10) return 'expert';
    if (experience >= 5) return 'professional';
    if (experience >= 2) return 'intermediate';
    return 'beginner';
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Apply custom ranking weights based on search context
   */
  getCustomWeights(context: SearchContext): RankingWeights {
    const weights = { ...this.defaultWeights };

    // Adjust weights based on search context
    if (context.userPreferences?.verifiedOnly) {
      weights.verification = 0.2;
      weights.relevance = 0.2;
    }

    if (context.location) {
      weights.location = 0.15;
      weights.relevance = 0.2;
    }

    if (context.userPreferences?.experienceLevel) {
      weights.experience = 0.2;
      weights.relevance = 0.2;
    }

    // Normalize weights to sum to 1
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    for (const key in weights) {
      weights[key as keyof RankingWeights] /= total;
    }

    return weights;
  }
}

export const searchRankingEngine = new SearchRankingEngine();
