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
): Promise<void> {
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

    if (!existingEnrollment) {
      await tx.enrollments.create({
        data: {
          id: await nextEnrollmentId(tx),
          student_id: student.id,
          class_id: classId,
          final_result: 'IN_PROGRESS',
          created_at: now,
        },
      })
    }
  }
}

async function ensureAssignment(
  tx: TransactionClient,
  teacherId: bigint,
  classId: bigint,
  subjectId: bigint,
  now: Date,
): Promise<void> {
  const existing = await tx.assignments.findFirst({
    where: {
      teacher_id: teacherId,
      class_id: classId,
      subject_id: subjectId,
    },
    select: { id: true },
  })

  if (existing) {
    return
  }

  await tx.assignments.create({
    data: {
      id: await nextAssignmentId(tx),
      teacher_id: teacherId,
      class_id: classId,
      subject_id: subjectId,
      created_at: now,
    },
  })
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

    await ensureStudents(tx, classRecord.id, hashedPassword, now)

    const mathSubjectId = subjectIds.get('Matemática')
    if (!mathSubjectId) {
      throw new Error('Disciplina Matemática não encontrada após o seed.')
    }

    await ensureAssignment(tx, teacher.id, classRecord.id, mathSubjectId, now)
  })

  console.log('Seed de demonstração concluído com sucesso.')
  console.log('')
  console.log('Contas de acesso (senha: 123456):')
  console.log('  Secretaria: admin@classon.com')
  console.log('  Professor:  prof1@classon.com')
  console.log('  Alunos:     aluno1@classon.com … aluno5@classon.com')
  console.log('')
  console.log('Cenário: Ano letivo 2026 · Turma 9º Ano A · Atribuição Matemática (Prof. João Silva)')
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
