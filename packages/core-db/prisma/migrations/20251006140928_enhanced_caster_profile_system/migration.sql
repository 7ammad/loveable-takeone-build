/*
  Warnings:

  - You are about to drop the column `companyName` on the `CasterProfile` table. All the data in the column will be lost.
  - You are about to drop the column `yearsInBusiness` on the `CasterProfile` table. All the data in the column will be lost.
  - Added the required column `companyCategory` to the `CasterProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyNameEn` to the `CasterProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `companyType` on table `CasterProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `businessPhone` on table `CasterProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `businessEmail` on table `CasterProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `CasterProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "coverLetter" TEXT,
ADD COLUMN     "headshotUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT;

-- AlterTable
ALTER TABLE "CasterProfile" DROP COLUMN "companyName",
DROP COLUMN "yearsInBusiness",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "companyCategory" TEXT NOT NULL,
ADD COLUMN     "companyDescription" TEXT,
ADD COLUMN     "companyNameAr" TEXT,
ADD COLUMN     "companyNameEn" TEXT NOT NULL,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "complianceStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "establishedYear" INTEGER,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "lastComplianceCheck" TIMESTAMP(3),
ADD COLUMN     "licenseAuthorities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "licenseNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "showreelUrl" TEXT,
ADD COLUMN     "totalHires" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalJobsPosted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "typeSpecificFields" JSONB,
ADD COLUMN     "verificationDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ALTER COLUMN "companyType" SET NOT NULL,
ALTER COLUMN "businessPhone" SET NOT NULL,
ALTER COLUMN "businessEmail" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL;

-- AlterTable
ALTER TABLE "CastingCall" ADD COLUMN     "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "projectType" TEXT,
ADD COLUMN     "shootingDuration" TEXT;

-- CreateTable
CREATE TABLE "CasterProject" (
    "id" TEXT NOT NULL,
    "casterProfileId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "clientName" TEXT,
    "projectYear" INTEGER NOT NULL,
    "projectDescription" TEXT,
    "projectUrl" TEXT,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasterProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasterTeamMember" (
    "id" TEXT NOT NULL,
    "casterProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "bio" TEXT,
    "imageUrl" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasterTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasterReview" (
    "id" TEXT NOT NULL,
    "casterProfileId" TEXT NOT NULL,
    "talentUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT,
    "projectName" TEXT,
    "professionalism" INTEGER,
    "communication" INTEGER,
    "paymentOnTime" INTEGER,
    "workEnvironment" INTEGER,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedHire" BOOLEAN NOT NULL DEFAULT false,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasterReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "participant1Id" TEXT NOT NULL,
    "participant2Id" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentShortlist" (
    "id" TEXT NOT NULL,
    "casterUserId" TEXT NOT NULL,
    "talentUserId" TEXT NOT NULL,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentShortlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "talentUserId" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    "specificDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditionBooking" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "talentUserId" TEXT NOT NULL,
    "casterUserId" TEXT NOT NULL,
    "castingCallId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    "meetingType" TEXT NOT NULL,
    "location" TEXT,
    "meetingUrl" TEXT,
    "meetingPassword" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "cancelledBy" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "reminderSent24h" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent1h" BOOLEAN NOT NULL DEFAULT false,
    "casterNotes" TEXT,
    "talentNotes" TEXT,
    "calcomEventId" TEXT,
    "calcomBookingUid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditionBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CasterProject_casterProfileId_idx" ON "CasterProject"("casterProfileId");

-- CreateIndex
CREATE INDEX "CasterProject_featured_displayOrder_idx" ON "CasterProject"("featured", "displayOrder");

-- CreateIndex
CREATE INDEX "CasterTeamMember_casterProfileId_idx" ON "CasterTeamMember"("casterProfileId");

-- CreateIndex
CREATE INDEX "CasterReview_casterProfileId_idx" ON "CasterReview"("casterProfileId");

-- CreateIndex
CREATE INDEX "CasterReview_rating_idx" ON "CasterReview"("rating");

-- CreateIndex
CREATE INDEX "CasterReview_isVerified_idx" ON "CasterReview"("isVerified");

-- CreateIndex
CREATE INDEX "Conversation_participant1Id_idx" ON "Conversation"("participant1Id");

-- CreateIndex
CREATE INDEX "Conversation_participant2Id_idx" ON "Conversation"("participant2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_participant1Id_participant2Id_key" ON "Conversation"("participant1Id", "participant2Id");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "TalentShortlist_casterUserId_idx" ON "TalentShortlist"("casterUserId");

-- CreateIndex
CREATE INDEX "TalentShortlist_talentUserId_idx" ON "TalentShortlist"("talentUserId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentShortlist_casterUserId_talentUserId_key" ON "TalentShortlist"("casterUserId", "talentUserId");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_talentUserId_idx" ON "AvailabilitySlot"("talentUserId");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_dayOfWeek_idx" ON "AvailabilitySlot"("dayOfWeek");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_specificDate_idx" ON "AvailabilitySlot"("specificDate");

-- CreateIndex
CREATE UNIQUE INDEX "AuditionBooking_applicationId_key" ON "AuditionBooking"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditionBooking_calcomBookingUid_key" ON "AuditionBooking"("calcomBookingUid");

-- CreateIndex
CREATE INDEX "AuditionBooking_talentUserId_idx" ON "AuditionBooking"("talentUserId");

-- CreateIndex
CREATE INDEX "AuditionBooking_casterUserId_idx" ON "AuditionBooking"("casterUserId");

-- CreateIndex
CREATE INDEX "AuditionBooking_castingCallId_idx" ON "AuditionBooking"("castingCallId");

-- CreateIndex
CREATE INDEX "AuditionBooking_scheduledAt_idx" ON "AuditionBooking"("scheduledAt");

-- CreateIndex
CREATE INDEX "AuditionBooking_status_idx" ON "AuditionBooking"("status");

-- AddForeignKey
ALTER TABLE "CasterProfile" ADD CONSTRAINT "CasterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasterProject" ADD CONSTRAINT "CasterProject_casterProfileId_fkey" FOREIGN KEY ("casterProfileId") REFERENCES "CasterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasterTeamMember" ADD CONSTRAINT "CasterTeamMember_casterProfileId_fkey" FOREIGN KEY ("casterProfileId") REFERENCES "CasterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasterReview" ADD CONSTRAINT "CasterReview_casterProfileId_fkey" FOREIGN KEY ("casterProfileId") REFERENCES "CasterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_talentUserId_fkey" FOREIGN KEY ("talentUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastingCall" ADD CONSTRAINT "CastingCall_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentShortlist" ADD CONSTRAINT "TalentShortlist_casterUserId_fkey" FOREIGN KEY ("casterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentShortlist" ADD CONSTRAINT "TalentShortlist_talentUserId_fkey" FOREIGN KEY ("talentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_talentUserId_fkey" FOREIGN KEY ("talentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionBooking" ADD CONSTRAINT "AuditionBooking_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionBooking" ADD CONSTRAINT "AuditionBooking_talentUserId_fkey" FOREIGN KEY ("talentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionBooking" ADD CONSTRAINT "AuditionBooking_casterUserId_fkey" FOREIGN KEY ("casterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionBooking" ADD CONSTRAINT "AuditionBooking_castingCallId_fkey" FOREIGN KEY ("castingCallId") REFERENCES "CastingCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
