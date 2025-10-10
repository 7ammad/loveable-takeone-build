-- CreateTable
CREATE TABLE "LlmLearningPattern" (
    "id" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "occurrences" INTEGER NOT NULL DEFAULT 0,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "examples" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LlmLearningPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LlmFeedback" (
    "id" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "wasMissed" BOOLEAN NOT NULL,
    "correctClassification" BOOLEAN NOT NULL,
    "extractedPatterns" TEXT[],
    "userFeedback" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LlmFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LlmLearningPattern_pattern_type_key" ON "LlmLearningPattern"("pattern", "type");

-- CreateIndex
CREATE INDEX "LlmLearningPattern_confidence_idx" ON "LlmLearningPattern"("confidence");

-- CreateIndex
CREATE INDEX "LlmLearningPattern_type_idx" ON "LlmLearningPattern"("type");

-- CreateIndex
CREATE INDEX "LlmFeedback_timestamp_idx" ON "LlmFeedback"("timestamp");
