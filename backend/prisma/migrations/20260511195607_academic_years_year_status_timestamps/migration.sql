-- CreateTable
CREATE TABLE "academic_years" (
    "id" BIGINT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_reads" (
    "id" BIGINT NOT NULL,
    "announcement_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "read_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" BIGINT NOT NULL,
    "creator_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "scope_type" VARCHAR(255) NOT NULL,
    "target_type" VARCHAR(255) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements_targets" (
    "id" BIGINT NOT NULL,
    "announcement_id" BIGINT NOT NULL,
    "class_id" BIGINT,
    "student_id" BIGINT,

    CONSTRAINT "announcements_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" BIGINT NOT NULL,
    "teacher_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "lesson_id" BIGINT NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bimesters" (
    "id" BIGINT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "year_id" BIGINT NOT NULL,

    CONSTRAINT "bimesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" BIGINT NOT NULL,
    "year_id" BIGINT NOT NULL,
    "series" INTEGER NOT NULL,
    "letter" VARCHAR(255) NOT NULL,
    "shift" VARCHAR(255) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "teacher_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "final_result" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" BIGINT NOT NULL,
    "enrollment_id" BIGINT NOT NULL,
    "assignment_id" BIGINT NOT NULL,
    "bimester_id" BIGINT NOT NULL,
    "n1" DECIMAL(8,2) NOT NULL,
    "n2" DECIMAL(8,2) NOT NULL,
    "n3" DECIMAL(8,2) NOT NULL,
    "n4" DECIMAL(8,2) NOT NULL,
    "average" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" BIGINT NOT NULL,
    "assignment_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "lesson_order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" BIGINT NOT NULL,
    "conversation_id" BIGINT NOT NULL,
    "sender_id" BIGINT NOT NULL,
    "content" TEXT NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "rm" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_submissions" (
    "id" BIGINT NOT NULL,
    "task_id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "observation" TEXT,
    "submitted_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "task_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_targets" (
    "id" BIGINT NOT NULL,
    "task_id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "task_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" BIGINT NOT NULL,
    "assignment_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "target_mode" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "registration_code" VARCHAR(255) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGINT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_year_unique" ON "academic_years"("year");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_reads_unique" ON "announcement_reads"("announcement_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_unique" ON "assignments"("teacher_id", "class_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_unique" ON "attendances"("student_id", "lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "bimesters_unique" ON "bimesters"("year_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "classes_unique_identity" ON "classes"("year_id", "series", "letter", "shift");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_student_teacher_unique" ON "conversations"("student_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_unique" ON "enrollments"("student_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "grades_unique" ON "grades"("enrollment_id", "assignment_id", "bimester_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_unique" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_rm_unique" ON "students"("rm");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_unique" ON "subjects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "task_submissions_unique" ON "task_submissions"("task_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_targets_unique" ON "task_targets"("task_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_unique" ON "teachers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_registration_code_unique" ON "teachers"("registration_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "users"("email");

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "announcements_targets" ADD CONSTRAINT "announcements_targets_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "announcements_targets" ADD CONSTRAINT "announcements_targets_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "announcements_targets" ADD CONSTRAINT "announcements_targets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bimesters" ADD CONSTRAINT "bimesters_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "academic_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "academic_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_bimester_id_fkey" FOREIGN KEY ("bimester_id") REFERENCES "bimesters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_targets" ADD CONSTRAINT "task_targets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_targets" ADD CONSTRAINT "task_targets_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
