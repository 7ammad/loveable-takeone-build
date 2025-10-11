-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "amountBeforeVAT" INTEGER,
ADD COLUMN     "vatAmount" INTEGER,
ADD COLUMN     "vatRate" DOUBLE PRECISION;
