import 'dotenv/config'
import * as bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const DEMO_PASSWORD = '123456'
const ACADEMIC_YEAR = 2026

type SeedStudent = {
  email: string
  full_name: string
  rm: string
}

const DEMO_STUDENTS: SeedStudent[] = [
  { email: 'aluno1@classon.com', full_name: 'Ana Beatriz Souza', rm: '26101' },
  { email: 'aluno2@classon.com', full_name: 'Bruno Henrique Lima', rm: '26102' },
  { email: 'aluno3@classon.com', full_name: 'Carlos Eduardo Mendes', rm: '26103' },
  { email: 'aluno4@classon.com', full_name: 'Diana Oliveira Costa', rm: '26104' },
  { email: 'aluno5@classon.com', full_name: 'Eduardo Santos Pereira', rm: '26105' },
]

const SUBJECTS = [
  { name: 'Matemática', description: 'Disciplina de Matemática do Ensino Fundamental.' },
  { name: 'Português', description: 'Disciplina de Língua Portuguesa e Literatura.' },
  { name: 'História', description: 'Disciplina de História e Cultura.' },
] as const

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>

async function nextUserId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.users.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextStudentId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.students.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextTeacherId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.teachers.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextSubjectId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.subjects.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextClassId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.classes.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextAcademicYearId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.academic_years.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextBimesterId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.bimesters.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextEnrollmentId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.enrollments.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextAssignmentId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.assignments.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextLessonId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.lessons.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextAttendanceId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.attendances.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

async function nextGradeId(tx: TransactionClient): Promise<bigint> {
  const maxRecord = await tx.grades.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })
  return (maxRecord?.id ?? BigInt(0)) + BigInt(1)
}

type StudentRecord = {
  studentId: bigint
  enrollmentId: bigint
}

function calculateAverage(n1: number, n2: number, n3: number, n4: number): number {
  return Math.round(((n1 + n2 + n3 + n4) / 4) * 100) / 100
}

async function upsertUser(
  tx: TransactionClient,
  email: string,
  role: 'SECRETARIA' | 'PROFESSOR' | 'ALUNO',
  hashedPassword: string,
  now: Date,
): Promise<{ id: bigint }> {
  const existing = await tx.users.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existing) {
    return tx.users.update({
      where: { email },
      data: {
        password: hashedPassword,
        role,
        is_active: true,
      },
      select: { id: true },
    })
  }

  const id = await nextUserId(tx)

  return tx.users.create({
    data: {
      id,
      email,
      password: hashedPassword,
      role,
      is_active: true,
      created_at: now,
    },
    select: { id: true },
  })
}

async function ensureActiveAcademicYear(
  tx: TransactionClient,
  now: Date,
): Promise<{ id: bigint; year: number }> {
  await tx.academic_years.updateMany({
    where: { status: 'ACTIVE' },
    data: { status: 'CLOSED', updated_at: now },
  })

  const existingYear = await tx.academic_years.findUnique({
    where: { year: ACADEMIC_YEAR },
  })

  const academicYear =
    existingYear ??
    (await tx.academic_years.create({
      data: {
        id: await nextAcademicYearId(tx),
        year: ACADEMIC_YEAR,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      },
    }))

  if (existingYear && existingYear.status !== 'ACTIVE') {
    await tx.academic_years.update({
      where: { id: existingYear.id },
      data: { status: 'ACTIVE', updated_at: now },
    })
  }

  const existingBimesters = await tx.bimesters.findMany({
    where: { year_id: academicYear.id },
    select: { number: true },
  })

  const existingNumbers = new Set(existingBimesters.map((item) => item.number))
  let nextId = await nextBimesterId(tx)

  for (const number of [1, 2, 3, 4]) {
    if (existingNumbers.has(number)) {
      continue
    }

    await tx.bimesters.create({
      data: {
        id: nextId,
        number,
        status: 'ABERTO',
        year_id: academicYear.id,
      },
    })

    nextId += BigInt(1)
  }

  return { id: academicYear.id, year: ACADEMIC_YEAR }
}

async function ensureSubjects(
  tx: TransactionClient,
): Promise<Map<string, bigint>> {
  const subjectIds = new Map<string, bigint>()

  for (const subject of SUBJECTS) {
    const existing = await tx.subjects.findUnique({
      where: { name: subject.name },
      select: { id: true },
    })

    if (existing) {
      await tx.subjects.update({
        where: { id: existing.id },
        data: { description: subject.description },
      })
      subjectIds.set(subject.name, existing.id)
      continue
    }

    const created = await tx.subjects.create({
      data: {
        id: await nextSubjectId(tx),
        name: subject.name,
        description: subject.description,
      },
      select: { id: true },
    })

    subjectIds.set(subject.name, created.id)
  }

  return subjectIds
}

async function ensureClass(
  tx: TransactionClient,
  yearId: bigint,
): Promise<{ id: bigint }> {
  const existing = await tx.classes.findFirst({
    where: {
      year_id: yearId,
      education_level: 'FUNDAMENTAL',
      series: 9,
      letter: 'A',
      shift: 'MORNING',
    },
    select: { id: true },
  })

  if (existing) {
    return existing
  }

  return tx.classes.create({
    data: {
      id: await nextClassId(tx),
      year_id: yearId,
      education_level: 'FUNDAMENTAL',
      series: 9,
      letter: 'A',
      shift: 'MORNING',
    },
    select: { id: true },
  })
}

async function ensureTeacher(
  tx: TransactionClient,
  hashedPassword: string,
  now: Date,
): Promise<{ id: bigint; user_id: bigint }> {
  const user = await upsertUser(tx, 'prof1@classon.com', 'PROFESSOR', hashedPassword, now)

  const existingTeacher =
    (await tx.teachers.findUnique({
      where: { user_id: user.id },
      select: { id: true, user_id: true },
    })) ??
    (await tx.teachers.findUnique({
      where: { registration_code: 'PROF001' },
      select: { id: true, user_id: true },
    }))

  if (existingTeacher) {
    const updated = await tx.teachers.update({
      where: { id: existingTeacher.id },
      data: {
        user_id: user.id,
        full_name: 'João Silva',
        registration_code: 'PROF001',
      },
      select: { id: true, user_id: true },
    })
    return updated
  }

  return tx.teachers.create({
    data: {
      id: await nextTeacherId(tx),
      user_id: user.id,
      full_name: 'João Silva',
      registration_code: 'PROF001',
    },
    select: { id: true, user_id: true },
  })
}

async function ensureStudents(
  tx: TransactionClient,
  classId: bigint,
  hashedPassword: string,
  now: Date,
): Promise<Map<string, StudentRecord>> {
  const records = new Map<string, StudentRecord>()

  for (const studentData of DEMO_STUDENTS) {
    const user = await upsertUser(
      tx,
      studentData.email,
      'ALUNO',
      hashedPassword,
      now,
    )

    const existingStudent =
      (await tx.students.findUnique({
        where: { user_id: user.id },
        select: { id: true },
      })) ??
      (await tx.students.findUnique({
        where: { rm: studentData.rm },
        select: { id: true },
      }))

    const student = existingStudent
      ? await tx.students.update({
          where: { id: existingStudent.id },
          data: {
            user_id: user.id,
            full_name: studentData.full_name,
            rm: studentData.rm,
            status: 'ACTIVE',
          },
          select: { id: true },
        })
      : await tx.students.create({
          data: {
            id: await nextStudentId(tx),
            user_id: user.id,
            full_name: studentData.full_name,
            rm: studentData.rm,
            status: 'ACTIVE',
          },
          select: { id: true },
        })

    const existingEnrollment = await tx.enrollments.findFirst({
      where: {
        student_id: student.id,
        class_id: classId,
      },
      select: { id: true },
    })

    let enrollmentId: bigint

    if (!existingEnrollment) {
      enrollmentId = await nextEnrollmentId(tx)
      await tx.enrollments.create({
        data: {
          id: enrollmentId,
          student_id: student.id,
          class_id: classId,
          final_result: 'IN_PROGRESS',
          created_at: now,
        },
      })
    } else {
      enrollmentId = existingEnrollment.id
    }

    records.set(studentData.email, {
      studentId: student.id,
      enrollmentId,
    })
  }

  return records
}

async function ensureAssignment(
  tx: TransactionClient,
  teacherId: bigint,
  classId: bigint,
  subjectId: bigint,
  now: Date,
): Promise<{ id: bigint }> {
  const existing = await tx.assignments.findFirst({
    where: {
      teacher_id: teacherId,
      class_id: classId,
      subject_id: subjectId,
    },
    select: { id: true },
  })

  if (existing) {
    return existing
  }

  const id = await nextAssignmentId(tx)

  await tx.assignments.create({
    data: {
      id,
      teacher_id: teacherId,
      class_id: classId,
      subject_id: subjectId,
      created_at: now,
    },
  })

  return { id }
}

/** Cenário dramático: aulas + chamada + notas para popular o gráfico de risco na abertura. */
async function seedDemoAcademicData(
  tx: TransactionClient,
  assignmentId: bigint,
  bimesterId: bigint,
  studentRecords: Map<string, StudentRecord>,
  now: Date,
): Promise<void> {
  const carlos = studentRecords.get('aluno3@classon.com')
  const bruno = studentRecords.get('aluno2@classon.com')
  const ana = studentRecords.get('aluno1@classon.com')
  const diana = studentRecords.get('aluno4@classon.com')
  const eduardo = studentRecords.get('aluno5@classon.com')

  if (!carlos || !bruno || !ana || !diana || !eduardo) {
    throw new Error('Alunos de demonstração não encontrados para o cenário acadêmico.')
  }

  const TOTAL_LESSONS = 10
  const lessonIds: bigint[] = []

  for (let order = 1; order <= TOTAL_LESSONS; order += 1) {
    const existingLesson = await tx.lessons.findFirst({
      where: { assignment_id: assignmentId, lesson_order: order },
      select: { id: true },
    })

    if (existingLesson) {
      lessonIds.push(existingLesson.id)
      continue
    }

    const lessonDate = new Date(now)
    lessonDate.setDate(lessonDate.getDate() - (TOTAL_LESSONS - order) * 7)

    const lessonId = await nextLessonId(tx)
    await tx.lessons.create({
      data: {
        id: lessonId,
        assignment_id: assignmentId,
        date: lessonDate,
        lesson_order: order,
        content: `Aula ${order} — Equações e funções do 1º grau`,
        created_at: now,
      },
    })
    lessonIds.push(lessonId)
  }

  /** Presenças por aluno (10 aulas): Carlos ~40%, Bruno ~80%, demais ≥90%. */
  const attendancePlan: Array<{
    record: StudentRecord
    absentLessonOrders: number[]
  }> = [
    { record: ana, absentLessonOrders: [] },
    { record: bruno, absentLessonOrders: [3, 7] },
    { record: carlos, absentLessonOrders: [1, 2, 4, 5, 8, 9] },
    { record: diana, absentLessonOrders: [6] },
    { record: eduardo, absentLessonOrders: [] },
  ]

  let nextAttId = await nextAttendanceId(tx)

  for (let index = 0; index < lessonIds.length; index += 1) {
    const lessonId = lessonIds[index]
    const lessonOrder = index + 1

    for (const { record, absentLessonOrders } of attendancePlan) {
      const status = absentLessonOrders.includes(lessonOrder) ? 'ABSENT' : 'PRESENT'

      const existingAttendance = await tx.attendances.findUnique({
        where: {
          student_id_lesson_id: {
            student_id: record.studentId,
            lesson_id: lessonId,
          },
        },
        select: { id: true },
      })

      if (existingAttendance) {
        await tx.attendances.update({
          where: { id: existingAttendance.id },
          data: { status },
        })
        continue
      }

      await tx.attendances.create({
        data: {
          id: nextAttId,
          student_id: record.studentId,
          lesson_id: lessonId,
          status,
          created_at: now,
        },
      })
      nextAttId += BigInt(1)
    }
  }

  /** Carlos: média 3.25 em Matemática → Risco Crítico (+40 nota +50 frequência). */
  const carlosGrades = { n1: 2, n2: 3, n3: 4, n4: 4 }
  const carlosAverage = calculateAverage(
    carlosGrades.n1,
    carlosGrades.n2,
    carlosGrades.n3,
    carlosGrades.n4,
  )

  await tx.grades.upsert({
    where: {
      enrollment_id_assignment_id_bimester_id: {
        enrollment_id: carlos.enrollmentId,
        assignment_id: assignmentId,
        bimester_id: bimesterId,
      },
    },
    update: {
      n1: carlosGrades.n1,
      n2: carlosGrades.n2,
      n3: carlosGrades.n3,
      n4: carlosGrades.n4,
      average: carlosAverage,
      final_average: carlosAverage,
    },
    create: {
      id: await nextGradeId(tx),
      enrollment_id: carlos.enrollmentId,
      assignment_id: assignmentId,
      bimester_id: bimesterId,
      n1: carlosGrades.n1,
      n2: carlosGrades.n2,
      n3: carlosGrades.n3,
      n4: carlosGrades.n4,
      average: carlosAverage,
      final_average: carlosAverage,
      created_at: now,
    },
  })
}

async function syncIdSequences(tx: TransactionClient) {
  const tables = [
    'academic_years',
    'users',
    'teachers',
    'students',
    'subjects',
    'classes',
    'bimesters',
    'enrollments',
    'assignments',
    'lessons',
    'attendances',
    'grades',
    'tasks',
    'task_targets',
    'task_submissions',
    'announcements',
    'announcements_targets',
    'announcement_reads',
    'events',
    'event_targets',
    'conversations',
    'messages',
  ]

  for (const table of tables) {
    await tx.$executeRawUnsafe(
      `SELECT setval('${table}_id_seq', COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false);`,
    )
  }
}

async function main() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)
  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await upsertUser(tx, 'admin@classon.com', 'SECRETARIA', hashedPassword, now)

    const academicYear = await ensureActiveAcademicYear(tx, now)
    const subjectIds = await ensureSubjects(tx)
    const classRecord = await ensureClass(tx, academicYear.id)
    const teacher = await ensureTeacher(tx, hashedPassword, now)

    const studentRecords = await ensureStudents(tx, classRecord.id, hashedPassword, now)

    const mathSubjectId = subjectIds.get('Matemática')
    if (!mathSubjectId) {
      throw new Error('Disciplina Matemática não encontrada após o seed.')
    }

    const assignment = await ensureAssignment(
      tx,
      teacher.id,
      classRecord.id,
      mathSubjectId,
      now,
    )

    const bimester1 = await tx.bimesters.findFirst({
      where: { year_id: academicYear.id, number: 1 },
      select: { id: true },
    })

    if (!bimester1) {
      throw new Error('1º bimestre não encontrado para o ano letivo de demonstração.')
    }

    await seedDemoAcademicData(
      tx,
      assignment.id,
      bimester1.id,
      studentRecords,
      now,
    )

    await syncIdSequences(tx)
  })

  console.log('Seed de demonstração concluído com sucesso.')
  console.log('')
  console.log('Contas de acesso (senha: 123456):')
  console.log('  Secretaria: admin@classon.com')
  console.log('  Professor:  prof1@classon.com')
  console.log('  Alunos:     aluno1@classon.com … aluno5@classon.com')
  console.log('')
  console.log('Cenário: Ano letivo 2026 · Turma 9º Ano A · Atribuição Matemática (Prof. João Silva)')
  console.log('Risco analítico: Carlos (Crítico) · Bruno (Alerta) · demais (Estável)')
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
