-- AlterTable
ALTER TABLE "User" ADD COLUMN     "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;
