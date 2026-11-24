-- Documento escolar do aluno (importação de lista por arquivo). Opcional: alunos
-- antigos e os criados manualmente ou em lote não têm.
ALTER TABLE "students" ADD COLUMN "document" VARCHAR(20);
CREATE UNIQUE INDEX "students_document_unique" ON "students"("document");
