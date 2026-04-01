CREATE TABLE "users"(
    "id" BIGINT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) CHECK ("role" IN('SECRETARIA', 'PROFESSOR', 'ALUNO')) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "users" ADD PRIMARY KEY("id");
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");

CREATE TABLE "academic_years"(
    "id" BIGINT NOT NULL,
    "year" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL
);
ALTER TABLE "academic_years" ADD PRIMARY KEY("id");
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_year_unique" UNIQUE("year");

CREATE TABLE "subjects"(
    "id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL
);
ALTER TABLE "subjects" ADD PRIMARY KEY("id");
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_name_unique" UNIQUE("name");

CREATE TABLE "students"(
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "rm" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) CHECK ("status" IN('ACTIVE', 'INACTIVE')) NOT NULL
);
ALTER TABLE "students" ADD PRIMARY KEY("id");
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_unique" UNIQUE("user_id");
ALTER TABLE "students" ADD CONSTRAINT "students_rm_unique" UNIQUE("rm");

CREATE TABLE "teachers"(
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "registration_code" VARCHAR(255) NOT NULL
);
ALTER TABLE "teachers" ADD PRIMARY KEY("id");
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_unique" UNIQUE("user_id");
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_registration_code_unique" UNIQUE("registration_code");

CREATE TABLE "classes"(
    "id" BIGINT NOT NULL,
    "year_id" BIGINT NOT NULL,
    "series" INTEGER NOT NULL,
    "letter" VARCHAR(255) NOT NULL,
    "shift" VARCHAR(255) CHECK ("shift" IN('MORNING', 'AFTERNOON', 'NIGHT')) NOT NULL
);
ALTER TABLE "classes" ADD PRIMARY KEY("id");
ALTER TABLE "classes" ADD CONSTRAINT "classes_unique_identity" UNIQUE("year_id", "series", "letter", "shift");

CREATE TABLE "bimesters"(
    "id" BIGINT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" VARCHAR(255) CHECK ("status" IN('OPEN', 'CLOSED')) NOT NULL,
    "year_id" BIGINT NOT NULL
);
ALTER TABLE "bimesters" ADD PRIMARY KEY("id");
ALTER TABLE "bimesters" ADD CONSTRAINT "bimesters_unique" UNIQUE("year_id", "number");

CREATE TABLE "enrollments"(
    "id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "final_result" VARCHAR(255) CHECK ("final_result" IN('PENDING', 'APPROVED', 'REPROVED', 'COMPLETED')) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "enrollments" ADD PRIMARY KEY("id");
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_unique" UNIQUE("student_id", "class_id");

CREATE TABLE "assignments"(
    "id" BIGINT NOT NULL,
    "teacher_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "assignments" ADD PRIMARY KEY("id");
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_unique" UNIQUE("teacher_id", "class_id", "subject_id");

CREATE TABLE "lessons"(
    "id" BIGINT NOT NULL,
    "assignment_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "lesson_order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "lessons" ADD PRIMARY KEY("id");

CREATE TABLE "attendances"(
    "id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "lesson_id" BIGINT NOT NULL,
    "status" VARCHAR(255) CHECK ("status" IN('PRESENT', 'ABSENT')) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "attendances" ADD PRIMARY KEY("id");
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_unique" UNIQUE("student_id", "lesson_id");

CREATE TABLE "grades"(
    "id" BIGINT NOT NULL,
    "enrollment_id" BIGINT NOT NULL,
    "assignment_id" BIGINT NOT NULL,
    "bimester_id" BIGINT NOT NULL,
    "n1" DECIMAL(8, 2) NOT NULL,
    "n2" DECIMAL(8, 2) NOT NULL,
    "n3" DECIMAL(8, 2) NOT NULL,
    "n4" DECIMAL(8, 2) NOT NULL,
    "average" DECIMAL(8, 2) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "grades" ADD PRIMARY KEY("id");
ALTER TABLE "grades" ADD CONSTRAINT "grades_unique" UNIQUE("enrollment_id", "assignment_id", "bimester_id");

CREATE TABLE "tasks"(
    "id" BIGINT NOT NULL,
    "assignment_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(255) CHECK ("status" IN('OPEN', 'CLOSED')) NOT NULL,
    "target_mode" VARCHAR(255) CHECK ("target_mode" IN('CLASS', 'SPECIFIC_STUDENTS')) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "tasks" ADD PRIMARY KEY("id");

CREATE TABLE "task_targets"(
    "id" BIGINT NOT NULL,
    "task_id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "task_targets" ADD PRIMARY KEY("id");
ALTER TABLE "task_targets" ADD CONSTRAINT "task_targets_unique" UNIQUE("task_id", "student_id");

CREATE TABLE "task_submissions"(
    "id" BIGINT NOT NULL,
    "task_id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "status" VARCHAR(255) CHECK ("status" IN('PENDING', 'SUBMITTED')) NOT NULL,
    "observation" TEXT NULL,
    "submitted_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "task_submissions" ADD PRIMARY KEY("id");
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_unique" UNIQUE("task_id", "student_id");

-- =========================
-- MÓDULO 6 (INTEGRADO)
-- =========================

CREATE TABLE "announcements"(
    "id" BIGINT NOT NULL,
    "creator_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(255) CHECK ("status" IN('DRAFT', 'PUBLISHED')) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "scope_type" VARCHAR(255) NOT NULL,
    "target_type" VARCHAR(255) CHECK (
        "target_type" IN(
            'ALL_SYSTEM',
            'ALL_STUDENTS',
            'ALL_TEACHERS',
            'SPECIFIC_CLASSES',
            'SPECIFIC_STUDENTS',
            'MIXED'
        )
    ) NOT NULL
);
ALTER TABLE "announcements" ADD PRIMARY KEY("id");

CREATE TABLE "announcement_reads"(
    "id" BIGINT NOT NULL,
    "announcement_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "read_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "announcement_reads" ADD PRIMARY KEY("id");
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_unique" UNIQUE("announcement_id", "user_id");

CREATE TABLE "conversations"(
    "id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "teacher_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "conversations" ADD PRIMARY KEY("id");
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_student_teacher_unique" UNIQUE("student_id", "teacher_id");

CREATE TABLE "messages"(
    "id" BIGINT NOT NULL,
    "conversation_id" BIGINT NOT NULL,
    "sender_id" BIGINT NOT NULL,
    "content" TEXT NOT NULL,
    "status" VARCHAR(255) CHECK ("status" IN('SENT', 'READ')) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE "messages" ADD PRIMARY KEY("id");

CREATE TABLE "announcements_targets"(
    "id" BIGINT NOT NULL,
    "announcement_id" BIGINT NOT NULL,
    "class_id" BIGINT,
    "student_id" BIGINT,
    CONSTRAINT "announcements_targets_check"
        CHECK (class_id IS NOT NULL OR student_id IS NOT NULL)
);
ALTER TABLE "announcements_targets" ADD PRIMARY KEY("id");

-- =========================
-- FOREIGN KEYS (GERAL)
-- =========================

ALTER TABLE "students" ADD FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE "teachers" ADD FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE "classes" ADD FOREIGN KEY("year_id") REFERENCES "academic_years"("id");
ALTER TABLE "bimesters" ADD FOREIGN KEY("year_id") REFERENCES "academic_years"("id");
ALTER TABLE "enrollments" ADD FOREIGN KEY("student_id") REFERENCES "students"("id");
ALTER TABLE "enrollments" ADD FOREIGN KEY("class_id") REFERENCES "classes"("id");
ALTER TABLE "assignments" ADD FOREIGN KEY("teacher_id") REFERENCES "teachers"("id");
ALTER TABLE "assignments" ADD FOREIGN KEY("class_id") REFERENCES "classes"("id");
ALTER TABLE "assignments" ADD FOREIGN KEY("subject_id") REFERENCES "subjects"("id");
ALTER TABLE "lessons" ADD FOREIGN KEY("assignment_id") REFERENCES "assignments"("id");
ALTER TABLE "attendances" ADD FOREIGN KEY("student_id") REFERENCES "students"("id");
ALTER TABLE "attendances" ADD FOREIGN KEY("lesson_id") REFERENCES "lessons"("id");
ALTER TABLE "grades" ADD FOREIGN KEY("enrollment_id") REFERENCES "enrollments"("id");
ALTER TABLE "grades" ADD FOREIGN KEY("assignment_id") REFERENCES "assignments"("id");
ALTER TABLE "grades" ADD FOREIGN KEY("bimester_id") REFERENCES "bimesters"("id");
ALTER TABLE "tasks" ADD FOREIGN KEY("assignment_id") REFERENCES "assignments"("id");
ALTER TABLE "task_targets" ADD FOREIGN KEY("task_id") REFERENCES "tasks"("id");
ALTER TABLE "task_targets" ADD FOREIGN KEY("student_id") REFERENCES "students"("id");
ALTER TABLE "task_submissions" ADD FOREIGN KEY("task_id") REFERENCES "tasks"("id");
ALTER TABLE "task_submissions" ADD FOREIGN KEY("student_id") REFERENCES "students"("id");

-- módulo 6 FKs
ALTER TABLE "announcements" ADD FOREIGN KEY("creator_id") REFERENCES "users"("id");
ALTER TABLE "announcement_reads" ADD FOREIGN KEY("announcement_id") REFERENCES "announcements"("id");
ALTER TABLE "announcement_reads" ADD FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE "conversations" ADD FOREIGN KEY("student_id") REFERENCES "students"("id");
ALTER TABLE "conversations" ADD FOREIGN KEY("teacher_id") REFERENCES "teachers"("id");
ALTER TABLE "messages" ADD FOREIGN KEY("conversation_id") REFERENCES "conversations"("id");
ALTER TABLE "messages" ADD FOREIGN KEY("sender_id") REFERENCES "users"("id");
ALTER TABLE "announcements_targets" ADD FOREIGN KEY("announcement_id") REFERENCES "announcements"("id");
ALTER TABLE "announcements_targets" ADD FOREIGN KEY("class_id") REFERENCES "classes"("id");
ALTER TABLE "announcements_targets" ADD FOREIGN KEY("student_id") REFERENCES "students"("id");