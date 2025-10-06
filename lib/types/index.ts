// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'talent' | 'caster';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  nafathVerified: boolean;
  nafathVerifiedAt?: string;
  nafathNationalId?: string;
  nafathExpiresAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'talent' | 'caster';
}

// Talent Profile
export interface TalentProfile {
  id: string;
  userId: string;
  stageName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  eyeColor?: string;
  hairColor?: string;
  skills: string[];
  languages: string[];
  experience: number;
  city: string;
  willingToTravel: boolean;
  portfolioUrl?: string;
  demoReelUrl?: string;
  instagramUrl?: string;
  rating?: number;
  completionPercentage: number;
  verified: boolean;
}

// Caster Profile
export interface CasterProfile {
  id: string;
  userId: string;
  companyName: string;
  companyType: 'production_company' | 'advertising_agency' | 'independent';
  commercialRegistration: string;
  businessPhone: string;
  businessEmail: string;
  website?: string;
  city: string;
  yearsInBusiness: number;
  teamSize: number;
  specializations: string[];
  verified: boolean;
}

// Casting Call
export interface CastingCall {
  id: string;
  title: string;
  description?: string;
  company?: string;
  location?: string;
  compensation?: string;
  requirements?: string;
  deadline?: string;
  contactInfo?: string;
  status: 'published' | 'draft' | 'closed' | 'pending_review';
  sourceUrl?: string;
  sourceName?: string;
  isAggregated: boolean;
  views: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Application
export interface Application {
  id: string;
  castingCallId: string;
  talentUserId: string;
  status: 'pending' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  availability?: string;
  additionalInfo?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  castingCall?: CastingCall;
  talent?: {
    name: string;
    email: string;
    talentProfile?: TalentProfile;
  };
}

// Message
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  body: string;
  read: boolean;
  castingCallId?: string;
  attachments?: string[];
  createdAt: string;
}

// Notification
export interface Notification {
  id: string;
  type: 'application_update' | 'message' | 'casting_call' | 'system';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response
export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: Array<{ path: string; message: string }>;
}

