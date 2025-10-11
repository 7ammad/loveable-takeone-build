/*
  Warnings:

  - You are about to drop the column `targetId` on the `AuditEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuditEvent" DROP COLUMN "targetId",
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "resourceId" TEXT,
ADD COLUMN     "resourceType" TEXT,
ADD COLUMN     "success" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "AuditEvent_actorUserId_timestamp_idx" ON "AuditEvent"("actorUserId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_timestamp_idx" ON "AuditEvent"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "AuditEvent_resourceType_resourceId_idx" ON "AuditEvent"("resourceType", "resourceId");
