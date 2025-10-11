-- CreateIndex
CREATE INDEX "Application_castingCallId_status_idx" ON "Application"("castingCallId", "status");

-- CreateIndex
CREATE INDEX "Application_talentUserId_createdAt_idx" ON "Application"("talentUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CastingCall_status_createdAt_idx" ON "CastingCall"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CastingCall_location_status_idx" ON "CastingCall"("location", "status");

-- CreateIndex
CREATE INDEX "CastingCall_deadline_status_idx" ON "CastingCall"("deadline", "status");

-- CreateIndex
CREATE INDEX "CastingCall_isAggregated_status_idx" ON "CastingCall"("isAggregated", "status");

-- CreateIndex
CREATE INDEX "CastingCall_createdBy_status_idx" ON "CastingCall"("createdBy", "status");
