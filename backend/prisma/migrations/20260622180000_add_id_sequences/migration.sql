-- PostgreSQL sequences for BigInt primary keys (replaces manual max(id)+1 / timestamp IDs)

CREATE SEQUENCE IF NOT EXISTS academic_years_id_seq AS bigint;
SELECT setval('academic_years_id_seq', COALESCE((SELECT MAX(id) FROM academic_years), 0) + 1, false);
ALTER TABLE academic_years ALTER COLUMN id SET DEFAULT nextval('academic_years_id_seq');
ALTER SEQUENCE academic_years_id_seq OWNED BY academic_years.id;

CREATE SEQUENCE IF NOT EXISTS users_id_seq AS bigint;
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
ALTER SEQUENCE users_id_seq OWNED BY users.id;

CREATE SEQUENCE IF NOT EXISTS teachers_id_seq AS bigint;
SELECT setval('teachers_id_seq', COALESCE((SELECT MAX(id) FROM teachers), 0) + 1, false);
ALTER TABLE teachers ALTER COLUMN id SET DEFAULT nextval('teachers_id_seq');
ALTER SEQUENCE teachers_id_seq OWNED BY teachers.id;

CREATE SEQUENCE IF NOT EXISTS students_id_seq AS bigint;
SELECT setval('students_id_seq', COALESCE((SELECT MAX(id) FROM students), 0) + 1, false);
ALTER TABLE students ALTER COLUMN id SET DEFAULT nextval('students_id_seq');
ALTER SEQUENCE students_id_seq OWNED BY students.id;

CREATE SEQUENCE IF NOT EXISTS subjects_id_seq AS bigint;
SELECT setval('subjects_id_seq', COALESCE((SELECT MAX(id) FROM subjects), 0) + 1, false);
ALTER TABLE subjects ALTER COLUMN id SET DEFAULT nextval('subjects_id_seq');
ALTER SEQUENCE subjects_id_seq OWNED BY subjects.id;

CREATE SEQUENCE IF NOT EXISTS classes_id_seq AS bigint;
SELECT setval('classes_id_seq', COALESCE((SELECT MAX(id) FROM classes), 0) + 1, false);
ALTER TABLE classes ALTER COLUMN id SET DEFAULT nextval('classes_id_seq');
ALTER SEQUENCE classes_id_seq OWNED BY classes.id;

CREATE SEQUENCE IF NOT EXISTS bimesters_id_seq AS bigint;
SELECT setval('bimesters_id_seq', COALESCE((SELECT MAX(id) FROM bimesters), 0) + 1, false);
ALTER TABLE bimesters ALTER COLUMN id SET DEFAULT nextval('bimesters_id_seq');
ALTER SEQUENCE bimesters_id_seq OWNED BY bimesters.id;

CREATE SEQUENCE IF NOT EXISTS enrollments_id_seq AS bigint;
SELECT setval('enrollments_id_seq', COALESCE((SELECT MAX(id) FROM enrollments), 0) + 1, false);
ALTER TABLE enrollments ALTER COLUMN id SET DEFAULT nextval('enrollments_id_seq');
ALTER SEQUENCE enrollments_id_seq OWNED BY enrollments.id;

CREATE SEQUENCE IF NOT EXISTS assignments_id_seq AS bigint;
SELECT setval('assignments_id_seq', COALESCE((SELECT MAX(id) FROM assignments), 0) + 1, false);
ALTER TABLE assignments ALTER COLUMN id SET DEFAULT nextval('assignments_id_seq');
ALTER SEQUENCE assignments_id_seq OWNED BY assignments.id;

CREATE SEQUENCE IF NOT EXISTS lessons_id_seq AS bigint;
SELECT setval('lessons_id_seq', COALESCE((SELECT MAX(id) FROM lessons), 0) + 1, false);
ALTER TABLE lessons ALTER COLUMN id SET DEFAULT nextval('lessons_id_seq');
ALTER SEQUENCE lessons_id_seq OWNED BY lessons.id;

CREATE SEQUENCE IF NOT EXISTS attendances_id_seq AS bigint;
SELECT setval('attendances_id_seq', COALESCE((SELECT MAX(id) FROM attendances), 0) + 1, false);
ALTER TABLE attendances ALTER COLUMN id SET DEFAULT nextval('attendances_id_seq');
ALTER SEQUENCE attendances_id_seq OWNED BY attendances.id;

CREATE SEQUENCE IF NOT EXISTS grades_id_seq AS bigint;
SELECT setval('grades_id_seq', COALESCE((SELECT MAX(id) FROM grades), 0) + 1, false);
ALTER TABLE grades ALTER COLUMN id SET DEFAULT nextval('grades_id_seq');
ALTER SEQUENCE grades_id_seq OWNED BY grades.id;

CREATE SEQUENCE IF NOT EXISTS tasks_id_seq AS bigint;
SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 0) + 1, false);
ALTER TABLE tasks ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq');
ALTER SEQUENCE tasks_id_seq OWNED BY tasks.id;

CREATE SEQUENCE IF NOT EXISTS task_targets_id_seq AS bigint;
SELECT setval('task_targets_id_seq', COALESCE((SELECT MAX(id) FROM task_targets), 0) + 1, false);
ALTER TABLE task_targets ALTER COLUMN id SET DEFAULT nextval('task_targets_id_seq');
ALTER SEQUENCE task_targets_id_seq OWNED BY task_targets.id;

CREATE SEQUENCE IF NOT EXISTS task_submissions_id_seq AS bigint;
SELECT setval('task_submissions_id_seq', COALESCE((SELECT MAX(id) FROM task_submissions), 0) + 1, false);
ALTER TABLE task_submissions ALTER COLUMN id SET DEFAULT nextval('task_submissions_id_seq');
ALTER SEQUENCE task_submissions_id_seq OWNED BY task_submissions.id;

CREATE SEQUENCE IF NOT EXISTS announcements_id_seq AS bigint;
SELECT setval('announcements_id_seq', COALESCE((SELECT MAX(id) FROM announcements), 0) + 1, false);
ALTER TABLE announcements ALTER COLUMN id SET DEFAULT nextval('announcements_id_seq');
ALTER SEQUENCE announcements_id_seq OWNED BY announcements.id;

CREATE SEQUENCE IF NOT EXISTS announcements_targets_id_seq AS bigint;
SELECT setval('announcements_targets_id_seq', COALESCE((SELECT MAX(id) FROM announcements_targets), 0) + 1, false);
ALTER TABLE announcements_targets ALTER COLUMN id SET DEFAULT nextval('announcements_targets_id_seq');
ALTER SEQUENCE announcements_targets_id_seq OWNED BY announcements_targets.id;

CREATE SEQUENCE IF NOT EXISTS announcement_reads_id_seq AS bigint;
SELECT setval('announcement_reads_id_seq', COALESCE((SELECT MAX(id) FROM announcement_reads), 0) + 1, false);
ALTER TABLE announcement_reads ALTER COLUMN id SET DEFAULT nextval('announcement_reads_id_seq');
ALTER SEQUENCE announcement_reads_id_seq OWNED BY announcement_reads.id;

CREATE SEQUENCE IF NOT EXISTS events_id_seq AS bigint;
SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 0) + 1, false);
ALTER TABLE events ALTER COLUMN id SET DEFAULT nextval('events_id_seq');
ALTER SEQUENCE events_id_seq OWNED BY events.id;

CREATE SEQUENCE IF NOT EXISTS event_targets_id_seq AS bigint;
SELECT setval('event_targets_id_seq', COALESCE((SELECT MAX(id) FROM event_targets), 0) + 1, false);
ALTER TABLE event_targets ALTER COLUMN id SET DEFAULT nextval('event_targets_id_seq');
ALTER SEQUENCE event_targets_id_seq OWNED BY event_targets.id;

CREATE SEQUENCE IF NOT EXISTS conversations_id_seq AS bigint;
SELECT setval('conversations_id_seq', COALESCE((SELECT MAX(id) FROM conversations), 0) + 1, false);
ALTER TABLE conversations ALTER COLUMN id SET DEFAULT nextval('conversations_id_seq');
ALTER SEQUENCE conversations_id_seq OWNED BY conversations.id;

CREATE SEQUENCE IF NOT EXISTS messages_id_seq AS bigint;
SELECT setval('messages_id_seq', COALESCE((SELECT MAX(id) FROM messages), 0) + 1, false);
ALTER TABLE messages ALTER COLUMN id SET DEFAULT nextval('messages_id_seq');
ALTER SEQUENCE messages_id_seq OWNED BY messages.id;
