-- AlterEnum
ALTER TYPE "ActivationBonusType" ADD VALUE 'SHOP_DISCOUNT';

-- AlterTable
ALTER TABLE "ActivationCode" ADD COLUMN     "assignedUserId" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "source" TEXT;

-- CreateIndex
CREATE INDEX "ActivationCode_assignedUserId_idx" ON "ActivationCode"("assignedUserId");

-- CreateIndex
CREATE INDEX "ActivationCode_source_idx" ON "ActivationCode"("source");

-- CreateIndex
CREATE INDEX "ActivationCode_bonusType_active_idx" ON "ActivationCode"("bonusType", "active");

-- AddForeignKey
ALTER TABLE "ActivationCode" ADD CONSTRAINT "ActivationCode_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
