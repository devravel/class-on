-- AlterTable: add education_level with safe default for existing rows
ALTER TABLE "classes" ADD COLUMN "education_level" VARCHAR(255) NOT NULL DEFAULT 'FUNDAMENTAL';

-- DropIndex: old identity without education level
DROP INDEX "classes_unique_identity";

-- CreateIndex: identity now includes education level (Fundamental 1A vs Médio 1A)
CREATE UNIQUE INDEX "classes_unique_identity" ON "classes"("year_id", "education_level", "series", "letter", "shift");
