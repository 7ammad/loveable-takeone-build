export type UserRole = "TALENT" | "GUARDIAN" | "HIRER" | "ADMIN";
export type CastingCallStatus = "DRAFT" | "OPEN" | "CLOSED";
export type ApplicationStatus = "APPLIED" | "SHORTLISTED" | "CONTACTED" | "REJECTED";
export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "PAST_DUE";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  nafathVerifiedAt?: string | null;
  createdAt: string;
}

export interface TalentAttribute {
  label: string;
  value: string;
}

export interface TalentMedia {
  type: "image" | "video";
  title: string;
  url: string;
  thumbnailUrl?: string;
}

export interface TalentProfile {
  id: string;
  userId: string;
  isMinor: boolean;
  guardianUserId?: string | null;
  managedByUserId?: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  city: string;
  languages: string[];
  bio: string;
  attributes: TalentAttribute[];
  media: TalentMedia[];
  availability: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CastingCall {
  id: string;
  hirerUserId: string;
  title: string;
  project: string;
  description: string;
  status: CastingCallStatus;
  shootingStart: string;
  shootingEnd: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleRequirement {
  label: string;
  value: string;
}

export interface Role {
  id: string;
  castingCallId: string;
  title: string;
  description: string;
  rate: string;
  requirements: RoleRequirement[];
}

export interface Application {
  id: string;
  talentProfileId: string;
  roleId: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  hirerUserId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageThread {
  id: string;
  applicationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderUserId: string;
  content: string;
  createdAt: string;
}

export interface ComplianceItem {
  id: string;
  talentProfileId: string;
  documentType: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  uploadedAt: string;
  expiresAt?: string;
  reviewerId?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceSAR: number;
  billingInterval: "monthly" | "annual";
  description: string;
  features: string[];
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

export interface TalentSearchFilters {
  query?: string;
  language?: string;
  city?: string;
  verifiedOnly?: boolean;
  ageRange?: [number, number];
  skills?: string[];
}

export interface HirerDashboardData {
  metrics: DashboardMetric[];
  recentCastingCalls: Array<{
    id: string;
    title: string;
    status: CastingCallStatus;
    applicants: number;
    updatedAt: string;
  }>;
  pipelineSummary: Array<{
    roleId: string;
    roleTitle: string;
    statusAggregation: Record<ApplicationStatus, number>;
  }>;
  activity: ActivityItem[];
}

export interface TalentApplicationSummary {
  profile: TalentProfile;
  applications: Application[];
}

export interface GuardianManagedProfile {
  guardian: User;
  profile: TalentProfile;
}

export interface AdminOverview {
  userCount: number;
  verifiedTalent: number;
  activeSubscriptions: number;
  compliancePending: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: ApplicationStatus;
  applications: Application[];
}

export interface MessagePreview {
  thread: MessageThread;
  latestMessage: Message;
  applicantName: string;
}

export interface Identity {
  userId: string;
  nafathStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
  verifiedAt?: string | null;
  docType?: string;
  docHash?: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  params: Record<string, unknown>;
  channels: Array<"email" | "sms">;
  frequency: "instant" | "daily" | "weekly";
  active: boolean;
  createdAt: string;
}

export interface ShareLink {
  id: string;
  entityType: "Shortlist" | "Role";
  entityId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  createdByUserId: string;
  accessCount: number;
  lastAccessedAt?: string;
}

export interface ModerationItem {
  id: string;
  talentProfileId: string;
  assetType: "image" | "video";
  filename: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  autoFlags: string[];
  submittedAt: string;
}

