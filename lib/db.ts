import {
  type ActivityItem,
  type AdminOverview,
  type Application,
  type ApplicationStatus,
  type CastingCall,
  type ComplianceItem,
  type GuardianManagedProfile,
  type DashboardMetric,
  type HirerDashboardData,
  type ModerationItem,
  type Identity,
  type SavedSearch,
  type ShareLink,
  type KanbanColumn,
  type Message,
  type MessagePreview,
  type MessageThread,
  type Role,
  type Subscription,
  type SubscriptionPlan,
  type TalentApplicationSummary,
  type TalentProfile,
  type TalentSearchFilters,
  type User,
} from "./definitions";
import { classForStatus, percentage } from "./utils";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const users: User[] = [
  {
    id: "user-talent-1",
    email: "amira.alharbi@example.com",
    fullName: "Amira Alharbi",
    role: "TALENT",
    nafathVerifiedAt: daysAgo(14),
    createdAt: daysAgo(240),
  },
  {
    id: "user-talent-2",
    email: "faisal.alkhaled@example.com",
    fullName: "Faisal Al Khaled",
    role: "TALENT",
    nafathVerifiedAt: daysAgo(30),
    createdAt: daysAgo(200),
  },
  {
    id: "talent-minor-1",
    email: "lina.alrashid@example.com",
    fullName: "Lina Al Rashid",
    role: "TALENT",
    createdAt: daysAgo(45),
  },
  {
    id: "user-guardian-1",
    email: "hala.guardian@example.com",
    fullName: "Hala Al Rashid",
    role: "GUARDIAN",
    nafathVerifiedAt: daysAgo(5),
    createdAt: daysAgo(60),
  },
  {
    id: "user-hirer-1",
    email: "casting@riyadhmedia.sa",
    fullName: "Riyadh Media Casting",
    role: "HIRER",
    nafathVerifiedAt: daysAgo(180),
    createdAt: daysAgo(365),
  },
  {
    id: "user-admin-1",
    email: "trustandsafety@scm.sa",
    fullName: "Trust & Safety Team",
    role: "ADMIN",
    createdAt: daysAgo(400),
  },
];

const identities: Identity[] = [
  {
    userId: "user-talent-1",
    nafathStatus: "VERIFIED",
    verifiedAt: daysAgo(14),
    docType: "NATIONAL_ID",
    docHash: "hash-verified-talent-1",
  },
  {
    userId: "user-guardian-1",
    nafathStatus: "VERIFIED",
    verifiedAt: daysAgo(5),
    docType: "NATIONAL_ID",
    docHash: "hash-guardian-1",
  },
  {
    userId: "user-hirer-1",
    nafathStatus: "VERIFIED",
    verifiedAt: daysAgo(180),
    docType: "COMMERCIAL_REGISTRATION",
    docHash: "hash-hirer-1",
  },
];

const savedSearches: SavedSearch[] = [
  {
    id: "saved-search-1",
    userId: "user-talent-1",
    name: "Commercial work Riyadh",
    params: { city: "Riyadh", auditionType: "InPerson" },
    channels: ["email"],
    frequency: "daily",
    active: true,
    createdAt: daysAgo(20),
  },
  {
    id: "saved-search-2",
    userId: "user-guardian-1",
    name: "Tween musical roles",
    params: { ageRange: [12, 14], skills: ["Singing"], verification: true },
    channels: ["sms", "email"],
    frequency: "instant",
    active: true,
    createdAt: daysAgo(15),
  },
  {
    id: "saved-search-3",
    userId: "user-hirer-1",
    name: "Bilingual presenters",
    params: { languages: ["Arabic", "English"], roleType: "Presenter" },
    channels: ["email"],
    frequency: "weekly",
    active: false,
    createdAt: daysAgo(40),
  },
];

const shareLinks: ShareLink[] = [
  {
    id: "share-link-1",
    entityType: "Shortlist",
    entityId: "role-1",
    token: "shortlist-token-1",
    expiresAt: daysAgo(-7),
    createdAt: daysAgo(5),
    createdByUserId: "user-hirer-1",
    accessCount: 4,
    lastAccessedAt: daysAgo(1),
  },
  {
    id: "share-link-2",
    entityType: "Role",
    entityId: "role-3",
    token: "role-token-2",
    expiresAt: daysAgo(-3),
    createdAt: daysAgo(2),
    createdByUserId: "user-hirer-1",
    accessCount: 1,
  },
];
const talentProfiles: TalentProfile[] = [
  {
    id: "talent-profile-1",
    userId: "user-talent-1",
    isMinor: false,
    guardianUserId: null,
    firstName: "Amira",
    lastName: "Alharbi",
    managedByUserId: null,
    dateOfBirth: "1998-03-14",
    city: "Riyadh",
    languages: ["Arabic", "English"],
    bio: "Classically trained actor with 6 years of TV commercial experience.",
    attributes: [
      { label: "Height", value: "168 cm" },
      { label: "Accents", value: "Najdi, Gulf English" },
      { label: "Skills", value: "Stage Combat, Voiceover" },
    ],
    media: [
      {
        type: "image",
        title: "Headshot",
        url: "/media/amira-headshot.jpg",
        thumbnailUrl: "/media/amira-headshot-thumb.jpg",
      },
      {
        type: "video",
        title: "Drama Reel 2024",
        url: "https://cdn.scm.sa/reels/amira-2024.mp4",
        thumbnailUrl: "/media/video-placeholder.jpg",
      },
    ],
    availability: "Open for projects from Nov 2025 onwards.",
    verified: true,
    createdAt: daysAgo(200),
    updatedAt: daysAgo(7),
  },
  {
    id: "talent-profile-2",
    userId: "user-talent-2",
    isMinor: false,
    guardianUserId: null,
    firstName: "Faisal",
    lastName: "Al Khaled",
    managedByUserId: null,
    dateOfBirth: "1995-11-21",
    city: "Jeddah",
    languages: ["Arabic"],
    bio: "Actor and voice talent specialising in historical dramas.",
    attributes: [
      { label: "Height", value: "182 cm" },
      { label: "Dialects", value: "Hijazi" },
      { label: "Skills", value: "Horse Riding, Oud" },
    ],
    media: [
      {
        type: "image",
        title: "Headshot",
        url: "/media/faisal-headshot.jpg",
      },
    ],
    availability: "Booked until mid December, reads scripts on weekends.",
    verified: true,
    createdAt: daysAgo(210),
    updatedAt: daysAgo(12),
  },
  {
    id: "talent-profile-3",
    userId: "talent-minor-1",
    isMinor: true,
    guardianUserId: "user-guardian-1",
    managedByUserId: "user-guardian-1",
    firstName: "Lina",
    lastName: "Al Rashid",
    dateOfBirth: "2011-06-05",
    city: "Riyadh",
    languages: ["Arabic", "English"],
    bio: "Young performer with musical theatre background.",
    attributes: [
      { label: "Height", value: "152 cm" },
      { label: "Skills", value: "Singing, Ballet" },
    ],
    media: [
      {
        type: "video",
        title: "Musical Showcase",
        url: "https://cdn.scm.sa/reels/lina-showcase.mp4",
      },
    ],
    availability: "Available for weekend shoots with guardian attendance.",
    verified: false,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(3),
  },
];

const castingCalls: CastingCall[] = [
  {
    id: "casting-call-1",
    hirerUserId: "user-hirer-1",
    title: "National Day Commercial",
    project: "Saudi National Day 95",
    description:
      "High-profile commercial celebrating the spirit of Saudi innovation.",
    status: "OPEN",
    shootingStart: daysAgo(-20),
    shootingEnd: daysAgo(-10),
    city: "Riyadh",
    createdAt: daysAgo(18),
    updatedAt: daysAgo(2),
  },
  {
    id: "casting-call-2",
    hirerUserId: "user-hirer-1",
    title: "Historical Series",
    project: "Sands of Time",
    description:
      "Ten-episode premium drama telling untold stories from the Hijaz region.",
    status: "DRAFT",
    shootingStart: daysAgo(-50),
    shootingEnd: daysAgo(-5),
    city: "AlUla",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(5),
  },
];

const roles: Role[] = [
  {
    id: "role-1",
    castingCallId: "casting-call-1",
    title: "Lead Talent",
    description:
      "Confident presenter able to deliver emotive narration in Arabic.",
    rate: "7,500 SAR / day",
    requirements: [
      { label: "Gender", value: "Female" },
      { label: "Age", value: "25-35" },
      { label: "Language", value: "Arabic, English" },
    ],
  },
  {
    id: "role-2",
    castingCallId: "casting-call-1",
    title: "Supporting Talent",
    description:
      "Energetic performer to portray young entrepreneur.",
    rate: "4,000 SAR / day",
    requirements: [
      { label: "Gender", value: "Male" },
      { label: "Age", value: "22-32" },
      { label: "Language", value: "Arabic" },
    ],
  },
  {
    id: "role-3",
    castingCallId: "casting-call-2",
    title: "Child Lead",
    description:
      "Singing role for episode 3 flashback sequence.",
    rate: "2,500 SAR / day",
    requirements: [
      { label: "Gender", value: "Female" },
      { label: "Age", value: "12-14" },
      { label: "Language", value: "Arabic" },
    ],
  },
];

const applications: Application[] = [
  {
    id: "application-1",
    talentProfileId: "talent-profile-1",
    roleId: "role-1",
    status: "SHORTLISTED",
    notes: "Strong chemistry read. Pending brand approval.",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
  },
  {
    id: "application-2",
    talentProfileId: "talent-profile-2",
    roleId: "role-2",
    status: "APPLIED",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: "application-3",
    talentProfileId: "talent-profile-3",
    roleId: "role-3",
    status: "CONTACTED",
    notes: "Guardian to confirm availability.",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  },
];

const subscriptions: Subscription[] = [
  {
    id: "subscription-1",
    hirerUserId: "user-hirer-1",
    planId: "annual",
    status: "ACTIVE",
    currentPeriodEnd: daysAgo(-320),
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
  },
];

const messageThreads: MessageThread[] = [
  {
    id: "thread-1",
    applicationId: "application-1",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
  },
  {
    id: "thread-2",
    applicationId: "application-3",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(0.5),
  },
];

const messages: Message[] = [
  {
    id: "message-1",
    threadId: "thread-1",
    senderUserId: "user-hirer-1",
    content: "Thanks Amira, the brand loved your self-tape. Can you join the chemistry session on Tuesday?",
    createdAt: daysAgo(1.2),
  },
  {
    id: "message-2",
    threadId: "thread-1",
    senderUserId: "user-talent-1",
    content: "Absolutely, Tuesday works. Sharing updated availability shortly.",
    createdAt: daysAgo(1),
  },
  {
    id: "message-3",
    threadId: "thread-2",
    senderUserId: "user-guardian-1",
    content: "Lina can attend the wardrobe fitting, please share the exact timings.",
    createdAt: daysAgo(0.5),
  },
];

const moderationItems: ModerationItem[] = [
  {
    id: "moderation-1",
    talentProfileId: "talent-profile-1",
    assetType: "video",
    filename: "amira-self-tape.mp4",
    status: "PENDING",
    autoFlags: ["Watermark applied", "Safe"],
    submittedAt: daysAgo(1),
  },
  {
    id: "moderation-2",
    talentProfileId: "talent-profile-3",
    assetType: "image",
    filename: "lina-headshot.jpg",
    status: "APPROVED",
    autoFlags: [],
    submittedAt: daysAgo(2),
  },
  {
    id: "moderation-3",
    talentProfileId: "talent-profile-2",
    assetType: "video",
    filename: "faisal-audition.mov",
    status: "REJECTED",
    autoFlags: ["Blurry", "Request re-upload"],
    submittedAt: daysAgo(3),
  },
];
const complianceItems: ComplianceItem[] = [
  {
    id: "compliance-1",
    talentProfileId: "talent-profile-3",
    documentType: "Guardian Consent",
    status: "PENDING",
    uploadedAt: daysAgo(1),
    reviewerId: "user-admin-1",
  },
  {
    id: "compliance-2",
    talentProfileId: "talent-profile-1",
    documentType: "PDPL Consent",
    status: "APPROVED",
    uploadedAt: daysAgo(14),
    reviewerId: "user-admin-1",
    expiresAt: daysAgo(-350),
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "monthly",
    name: "Professional Access Monthly",
    priceSAR: 199,
    billingInterval: "monthly",
    description: "Perfect for short-term campaigns.",
    features: [
      "Unlimited casting calls",
      "Verified talent search",
      "Shortlist & Kanban tracking",
      "Concierge compliance desk",
    ],
  },
  {
    id: "annual",
    name: "Professional Access Annual",
    priceSAR: 1999,
    billingInterval: "annual",
    description: "Best value for studios and agencies.",
    features: [
      "Dedicated success partner",
      "Priority compliance reviews",
      "White glove onboarding",
      "Early access to Phase B tooling",
    ],
  },
];

export function getIdentityByUserId(userId: string): Identity | undefined {
  return identities.find((identity) => identity.userId === userId);
}

export function listSavedSearchesByUser(userId: string): SavedSearch[] {
  return savedSearches.filter((search) => search.userId === userId);
}

export function createSavedSearch({
  userId,
  name,
  params,
  channels,
  frequency = "instant",
}: {
  userId: string;
  name: string;
  params: Record<string, unknown>;
  channels: Array<"email" | "sms">;
  frequency?: SavedSearch["frequency"];
}): SavedSearch {
  const newSearch: SavedSearch = {
    id: `saved-search-${savedSearches.length + 10}`,
    userId,
    name,
    params,
    channels,
    frequency,
    active: true,
    createdAt: new Date().toISOString(),
  };
  savedSearches.push(newSearch);
  return newSearch;
}

export function deactivateSavedSearch(id: string): boolean {
  const search = savedSearches.find((item) => item.id === id);
  if (!search) {
    return false;
  }
  search.active = false;
  return true;
}

export function listShareLinksByUser(userId: string): ShareLink[] {
  return shareLinks.filter((link) => link.createdByUserId === userId);
}

export function createShareLink({
  entityType,
  entityId,
  createdByUserId,
  expiresAt,
}: {
  entityType: ShareLink["entityType"];
  entityId: string;
  createdByUserId: string;
  expiresAt: string;
}): ShareLink {
  const link: ShareLink = {
    id: `share-link-${shareLinks.length + 10}`,
    entityType,
    entityId,
    token: `share-token-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    createdByUserId,
    expiresAt,
    accessCount: 0,
  };
  shareLinks.push(link);
  return link;
}

export function getShareLinkByToken(token: string): ShareLink | undefined {
  return shareLinks.find((link) => link.token === token);
}

export function listUsers(): User[] {
  return users;
}

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function listTalentProfiles(): TalentProfile[] {
  return talentProfiles;
}

export function getTalentProfileById(id: string): TalentProfile | undefined {
  return talentProfiles.find((profile) => profile.id === id);
}

export function findTalentProfileByUserId(userId: string): TalentProfile | undefined {
  return talentProfiles.find((profile) => profile.userId === userId);
}

export function searchTalentProfiles(filters: TalentSearchFilters = {}): TalentProfile[] {
  const {
    query,
    language,
    city,
    verifiedOnly,
    ageRange,
    skills,
  } = filters;

  return talentProfiles.filter((profile) => {
    if (verifiedOnly && !profile.verified) {
      return false;
    }

    if (language && !profile.languages.some((lang) => lang.toLowerCase() === language.toLowerCase())) {
      return false;
    }

    if (city && profile.city.toLowerCase() !== city.toLowerCase()) {
      return false;
    }

    if (query) {
      const haystack = `${profile.firstName} ${profile.lastName} ${profile.bio}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) {
        return false;
      }
    }

    if (skills && skills.length) {
      const attributeValues = profile.attributes.map((attr) => attr.value.toLowerCase());
      const hasAllSkills = skills.every((skill) =>
        attributeValues.some((value) => value.includes(skill.toLowerCase())),
      );
      if (!hasAllSkills) {
        return false;
      }
    }

    if (ageRange) {
      const [min, max] = ageRange;
      const birthYear = new Date(profile.dateOfBirth).getFullYear();
      const age = new Date().getFullYear() - birthYear;
      if (age < min || age > max) {
        return false;
      }
    }

    return true;
  });
}

export function listCastingCalls(): CastingCall[] {
  return castingCalls;
}

export function listCastingCallsByHirer(hirerUserId: string): CastingCall[] {
  return castingCalls.filter((call) => call.hirerUserId === hirerUserId);
}

export function getCastingCallById(id: string): CastingCall | undefined {
  return castingCalls.find((call) => call.id === id);
}

export function listRolesByCastingCall(castingCallId: string): Role[] {
  return roles.filter((role) => role.castingCallId === castingCallId);
}

export function getRoleById(id: string): Role | undefined {
  return roles.find((role) => role.id === id);
}

export function listApplicationsByTalent(talentProfileId: string): Application[] {
  return applications.filter((application) => application.talentProfileId === talentProfileId);
}

export function listApplicationsByRole(roleId: string): Application[] {
  return applications.filter((application) => application.roleId === roleId);
}

export function listApplicationsByCastingCall(castingCallId: string): Application[] {
  const roleIds = roles
    .filter((role) => role.castingCallId === castingCallId)
    .map((role) => role.id);
  return applications.filter((application) => roleIds.includes(application.roleId));
}

export function listSubscriptions(): Subscription[] {
  return subscriptions;
}

export function getSubscriptionByHirer(hirerUserId: string): Subscription | undefined {
  return subscriptions.find((subscription) => subscription.hirerUserId === hirerUserId);
}

export function listMessageThreadsByHirer(hirerUserId: string): MessagePreview[] {
  return messageThreads
    .map((thread) => {
      const application = applications.find((app) => app.id === thread.applicationId);
      if (!application) {
        return undefined;
      }
      const role = roles.find((item) => item.id === application.roleId);
      if (!role) {
        return undefined;
      }
      const castingCall = castingCalls.find((call) => call.id === role.castingCallId);
      if (!castingCall || castingCall.hirerUserId !== hirerUserId) {
        return undefined;
      }
      const talent = getTalentProfileById(application.talentProfileId);
      const latestMessage = messages
        .filter((message) => message.threadId === thread.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

      if (!latestMessage || !talent) {
        return undefined;
      }

      return {
        thread,
        latestMessage,
        applicantName: `${talent.firstName} ${talent.lastName}`,
      } satisfies MessagePreview;
    })
    .filter((preview): preview is MessagePreview => Boolean(preview));
}

export function listMessagesByThread(threadId: string): Message[] {
  return messages
    .filter((message) => message.threadId === threadId)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
}

export function listComplianceItems(): ComplianceItem[] {
  return complianceItems;
}

export function listModerationQueue(): ModerationItem[] {
  return moderationItems;
}
export function getComplianceItemsByStatus(status: ComplianceItem["status"]): ComplianceItem[] {
  return complianceItems.filter((item) => item.status === status);
}

export function listGuardianManagedProfiles(): GuardianManagedProfile[] {
  return talentProfiles
    .filter((profile) => profile.managedByUserId)
    .map((profile) => {
      const guardian = getUserById(profile.managedByUserId ?? "");
      if (!guardian) {
        return undefined;
      }
      return {
        guardian,
        profile,
      } satisfies GuardianManagedProfile;
    })
    .filter((item): item is GuardianManagedProfile => Boolean(item));
}

export function getTalentApplicationSummary(talentProfileId: string): TalentApplicationSummary | undefined {
  const profile = getTalentProfileById(talentProfileId);
  if (!profile) {
    return undefined;
  }
  const profileApplications = listApplicationsByTalent(talentProfileId);
  return {
    profile,
    applications: profileApplications,
  } satisfies TalentApplicationSummary;
}

export function buildKanbanColumns(castingCallId: string): KanbanColumn[] {
  const columnStatus: ApplicationStatus[] = [
    "APPLIED",
    "SHORTLISTED",
    "CONTACTED",
    "REJECTED",
  ];

  return columnStatus.map((status) => {
    const columnApplications = listApplicationsByCastingCall(castingCallId).filter(
      (application) => application.status === status,
    );
    return {
      id: `${castingCallId}-${status.toLowerCase()}`,
      title: status === "APPLIED" ? "Applied" : status.charAt(0) + status.slice(1).toLowerCase(),
      status,
      applications: columnApplications,
    } satisfies KanbanColumn;
  });
}

export function getAdminOverview(): AdminOverview {
  const verifiedTalent = talentProfiles.filter((profile) => profile.verified).length;
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === "ACTIVE").length;
  const compliancePending = complianceItems.filter((item) => item.status === "PENDING").length;

  return {
    userCount: users.length,
    verifiedTalent,
    activeSubscriptions,
    compliancePending,
  } satisfies AdminOverview;
}

export function getHirerDashboardData(hirerUserId: string): HirerDashboardData {
  const hirerCastingCalls = listCastingCallsByHirer(hirerUserId);
  const openRoles = roles.filter((role) => hirerCastingCalls.some((call) => call.id === role.castingCallId));
  const totalApplications = applications.filter((application) =>
    openRoles.some((role) => role.id === application.roleId),
  );

  const metrics: DashboardMetric[] = [
    {
      id: "metric-open-calls",
      label: "Active Casting Calls",
      value: String(hirerCastingCalls.filter((call) => call.status !== "CLOSED").length),
      change: "+2 new this month",
      trend: "up",
    },
    {
      id: "metric-total-applications",
      label: "Applicants",
      value: String(totalApplications.length),
      change: "12% vs last cycle",
      trend: "up",
    },
    {
      id: "metric-shortlist-rate",
      label: "Shortlist Rate",
      value: `${percentage(
        totalApplications.filter((application) => application.status === "SHORTLISTED").length,
        totalApplications.length || 1,
      )}%`,
      change: "Stable",
      trend: "flat",
    },
    {
      id: "metric-response-time",
      label: "Median Response",
      value: "6h",
      change: "-1h vs last week",
      trend: "down",
    },
  ];

  const pipelineSummary = openRoles.map((role) => {
    const roleApplications = listApplicationsByRole(role.id);
    const aggregation: Record<ApplicationStatus, number> = {
      APPLIED: 0,
      SHORTLISTED: 0,
      CONTACTED: 0,
      REJECTED: 0,
    };
    roleApplications.forEach((application) => {
      aggregation[application.status] += 1;
    });
    return {
      roleId: role.id,
      roleTitle: role.title,
      statusAggregation: aggregation,
    };
  });

  const activity: ActivityItem[] = totalApplications.map((application) => {
    const talent = getTalentProfileById(application.talentProfileId);
    const statusLabel = application.status.toLowerCase();
    return {
      id: `activity-${application.id}`,
      actor: talent ? `${talent.firstName} ${talent.lastName}` : "Talent",
      action: `Status updated to ${statusLabel}`,
      timestamp: application.updatedAt,
    } satisfies ActivityItem;
  });

  return {
    metrics,
    recentCastingCalls: hirerCastingCalls.map((call) => {
      const callApplications = listApplicationsByCastingCall(call.id);
      return {
        id: call.id,
        title: call.title,
        status: call.status,
        applicants: callApplications.length,
        updatedAt: call.updatedAt,
      };
    }),
    pipelineSummary,
    activity,
  } satisfies HirerDashboardData;
}

export function getMessageThreadById(id: string): MessageThread | undefined {
  return messageThreads.find((thread) => thread.id === id);
}

export function getApplicationsWithStatus(status: ApplicationStatus): Application[] {
  return applications.filter((application) => application.status === status);
}

export function getStatusBadge(status: string): string {
  return classForStatus(status);
}

export function getGuardianDashboard(): GuardianManagedProfile[] {
  return listGuardianManagedProfiles();
}

export function getAllRoles(): Role[] {
  return roles;
}














