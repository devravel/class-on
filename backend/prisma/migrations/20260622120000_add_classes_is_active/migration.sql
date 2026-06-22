-- AlterTable
ALTER TABLE "classes" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- DropIndex: allow reusing identity after deactivation
DROP INDEX "classes_unique_identity";

-- CreateIndex: unique identity only among active classes
CREATE UNIQUE INDEX "classes_unique_identity" ON "classes"("year_id", "education_level", "series", "letter", "shift") WHERE "is_active" = true;
