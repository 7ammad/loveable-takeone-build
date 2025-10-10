-- CreateTable
CREATE TABLE "ProcessedMessage" (
    "id" TEXT NOT NULL,
    "whatsappMessageId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedMessage_whatsappMessageId_key" ON "ProcessedMessage"("whatsappMessageId");

-- CreateIndex
CREATE INDEX "ProcessedMessage_whatsappMessageId_idx" ON "ProcessedMessage"("whatsappMessageId");

-- CreateIndex
CREATE INDEX "ProcessedMessage_sourceId_idx" ON "ProcessedMessage"("sourceId");

-- CreateIndex
CREATE INDEX "ProcessedMessage_processedAt_idx" ON "ProcessedMessage"("processedAt");
