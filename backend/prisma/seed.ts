import 'dotenv/config'
import * as bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const DEMO_PASSWORD = '123456'
const ACADEMIC_YEAR = 2026
const STUDENTS_PER_CLASS = 20
const LESSONS_PER_ASSIGNMENT = 10

type EducationLevel = 'FUNDAMENTAL' | 'MEDIO'

type ClassSeedConfig = {
  education_level: EducationLevel
  series: number
  letter: string
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT'
}

/** Turmas 1º–8º EF e 1º–3º EM (série A, manhã). */
const SCHOOL_CLASSES: ClassSeedConfig[] = [
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map((series) => ({
    education_level: 'FUNDAMENTAL' as const,
    series,
    letter: 'A',
    shift: 'MORNING' as const,
  })),
  ...([1, 2, 3] as const).map((series) => ({
    education_level: 'MEDIO' as const,
    series,
    letter: 'A',
    shift: 'MORNING' as const,
  })),
]

type SeedStudent = {
  email: string
  full_name: string
  rm: string
  globalIndex: number
}

type RiskProfile = 'ESTAVEL' | 'ALERTA' | 'CRITICO'

const STUDENT_FIRST_NAMES = [
  'Ana', 'Bruno', 'Carlos', 'Diana', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena',
  'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Paulo',
  'Rafaela', 'Samuel', 'Tatiana', 'Vinícius', 'Yasmin', 'Zeca', 'Amanda', 'Bernardo',
  'Camila', 'Daniel', 'Elisa', 'Felipe', 'Giovana', 'Henrique', 'Ingrid', 'Júlia',
  'Kauã', 'Larissa', 'Miguel', 'Natália', 'Otávio', 'Patrícia', 'Renato', 'Sofia',
]

const STUDENT_LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Pereira', 'Ferreira',
  'Rodrigues', 'Almeida', 'Nascimento', 'Araújo', 'Ribeiro', 'Carvalho', 'Gomes',
  'Martins', 'Rocha', 'Barbosa', 'Dias', 'Teixeira', 'Monteiro', 'Cardoso', 'Mendes',
  'Duarte', 'Azevedo', 'Camargo', 'Vieira', 'Pinto', 'Ramos', 'Correia',
]

function buildStudentsForClass(classIndex: number): SeedStudent[] {
  const students: SeedStudent[] = []
  const baseIndex = classIndex * STUDENTS_PER_CLASS

  for (let slot = 0; slot < STUDENTS_PER_CLASS; slot += 1) {
    const globalIndex = baseIndex + slot
    const studentNumber = globalIndex + 1
    const firstName = STUDENT_FIRST_NAMES[(globalIndex + classIndex) % STUDENT_FIRST_NAMES.length]
    const lastName = STUDENT_LAST_NAMES[(globalIndex * 3 + slot) % STUDENT_LAST_NAMES.length]
    const middleName = STUDENT_LAST_NAMES[(globalIndex * 7 + classIndex) % STUDENT_LAST_NAMES.length]

    students.push({
      email: `aluno${String(studentNumber).padStart(4, '0')}@classon.com`,
      full_name: `${firstName} ${middleName} ${lastName}`,
      rm: `${ACADEMIC_YEAR}${String(studentNumber).padStart(4, '0')}`,
      globalIndex,
    })
  }

  return students
}

function riskProfileForGlobalIndex(globalIndex: number, totalStudents: number): RiskProfile {
  const ratio = globalIndex / totalStudents
  if (ratio < 0.7) return 'ESTAVEL'
  if (ratio < 0.9) return 'ALERTA'
  return 'CRITICO'
}

function gradesForRiskProfile(profile: RiskProfile): {
  n1: number
  n2: number
  n3: number
  n4: number
} {
  switch (profile) {
    case 'ESTAVEL':
      return { n1: 8, n2: 8.5, n3: 9, n4: 8 }
    case 'ALERTA':
      return { n1: 5, n2: 5.5, n3: 5, n4: 5.5 }
    case 'CRITICO':
      return { n1: 3, n2: 2.5, n3: 3.5, n4: 3 }
  }
}

function absentLessonsForProfile(profile: RiskProfile, totalLessons: number): number[] {
  switch (profile) {
    case 'ESTAVEL':
      return totalLessons >= 10 ? [6] : []
    case 'ALERTA':
      return totalLessons >= 10 ? [2, 7] : [2]
    case 'CRITICO':
      return totalLessons >= 10 ? [1, 3, 5, 8] : [1, 2, 3, 4]
  }
}

/** Disciplinas do Ensino Fundamental alinhadas à BNCC. */
const BNCC_SUBJECTS = [
  {
    name: 'Matemática',
    description:
      'Componente curricular de Matemática — BNCC: raciocínio lógico, álgebra e geometria.',
  },
  {
    name: 'Português',
    description:
      'Língua Portuguesa — BNCC: leitura, produção de textos e análise linguística.',
  },
  {
    name: 'Ciências',
    description:
      'Ciências da Natureza — BNCC: investigação científica, vida e Terra.',
  },
  {
    name: 'História',
    description: 'História — BNCC: temporalidades, cultura e identidade.',
  },
  {
    name: 'Geografia',
    description: 'Geografia — BNCC: espaço geográfico, sociedade e ambiente.',
  },
  {
    name: 'Arte',
    description: 'Arte — BNCC: linguagens artísticas e cultura visual.',
  },
  {
    name: 'Educação Física',
    description:
      'Educação Física — BNCC: cultura corporal e práticas de saúde.',
  },
  {
    name: 'Língua Inglesa',
    description:
      'Língua Inglesa — BNCC: comunicação intercultural e multiletramentos.',
  },
] as const

/** Um professor exclusivo por disciplina BNCC. */
const BNCC_TEACHERS = [
  {
    subject: 'Matemática',
    full_name: 'João Silva',
    email: 'prof1@classon.com',
    registration_code: 'PROF001',
  },
  {
    subject: 'Português',
    full_name: 'Helena Alves',
    email: 'prof.portugues@classon.com',
    registration_code: 'PROF002',
  },
  {
    subject: 'Ciências',
    full_name: 'Patricia Gomes',
    email: 'prof.ciencias@classon.com',
    registration_code: 'PROF003',
  },
  {
    subject: 'História',
    full_name: 'Ricardo Mendes',
    email: 'prof.historia@classon.com',
    registration_code: 'PROF004',
  },
  {
    subject: 'Geografia',
    full_name: 'Fernando Rocha',
    email: 'prof.geografia@classon.com',
    registration_code: 'PROF005',
  },
  {
    subject: 'Arte',
    full_name: 'Camila Nascimento',
    email: 'prof.arte@classon.com',
    registration_code: 'PROF006',
  },
  {
    subject: 'Educação Física',
    full_name: 'Marcelo Vieira',
    email: 'prof.ef@classon.com',
    registration_code: 'PROF007',
  },
  {
    subject: 'Língua Inglesa',
    full_name: 'Sandra Oliveira',
    email: 'prof.ingles@classon.com',
    registration_code: 'PROF008',
  },
] as const

const LESSON_TOPICS: Record<string, string[]> = {
  Matemática: [
    'Equações do 1º grau',
    'Funções afins e gráficos',
    'Sistemas lineares',
    'Geometria plana — áreas',
    'Probabilidade básica',
    'Revisão bimestral',
    'Proporcionalidade e porcentagem',
    'Polinômios e produtos notáveis',
  ],
  Português: [
    'Interpretação de texto',
    'Figuras de linguagem',
    'Produção de artigo de opinião',
    'Variação linguística',
    'Literatura brasileira — romantismo',
    'Ortografia e pontuação',
    'Análise de charge e cartum',
    'Seminário de leitura',
  ],
  Ciências: [
    'Sistema nervoso e sinapses',
    'Genética e hereditariedade',
    'Ecologia e cadeias alimentares',
    'Química — tabela periódica',
    'Movimentos da Terra',
    'Saúde e prevenção de doenças',
    'Experimentos em laboratório',
    'Revisão integrada de Ciências',
  ],
  História: [
    'Brasil colonial — economia',
    'Independência e Primeiro Reinado',
    'Segundo Reinado e abolição',
    'República Velha',
    'Era Vargas',
    'Ditadura militar e redemocratização',
    'História local e patrimônio',
    'Seminário de história contemporânea',
  ],
  Geografia: [
    'Cartografia e coordenadas',
    'Climas e biomas brasileiros',
    'Urbanização e metrópoles',
    'Recursos naturais e sustentabilidade',
    'Globalização e fluxos econômicos',
    'Demografia e migrações',
    'Geopolítica mundial',
    'Estudo de caso — região amazônica',
  ],
  Arte: [
    'Elementos da linguagem visual',
    'Arte contemporânea brasileira',
    'Técnicas de desenho e sombra',
    'História da arte — modernismo',
    'Oficina de colagem',
    'Análise de obras em museu virtual',
    'Projeto autoral em grupo',
    'Mostra cultural da turma',
  ],
  'Educação Física': [
    'Avaliação física e condicionamento',
    'Esportes coletivos — futsal',
    'Ginástica e flexibilidade',
    'Atletismo — velocidade',
    'Jogos e recreação',
    'Saúde e qualidade de vida',
    'Danças urbanas',
    'Torneio interclasses',
  ],
  'Língua Inglesa': [
    'Present perfect e rotinas',
    'Vocabulary — technology',
    'Reading — short stories',
    'Listening — everyday situations',
    'Writing — formal e-mails',
    'Cultura dos países anglófonos',
    'Debate em inglês',
    'Projeto de conversação',
  ],
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>

type StudentRecord = {
  studentId: bigint
  enrollmentId: bigint
  email: string
  globalIndex: number
}

type TeacherRecord = {
  teacherId: bigint
  userId: bigint
  email: string
  full_name: string
}

const ID_MODELS = {
  users: 'users',
  students: 'students',
  teachers: 'teachers',
  subjects: 'subjects',
  classes: 'classes',
  academic_years: 'academic_years',
  bimesters: 'bimesters',
  enrollments: 'enrollments',
  assignments: 'assignments',
  lessons: 'lessons',
  attendances: 'attendances',
  grades: 'grades',
  tasks: 'tasks',
  task_targets: 'task_targets',
  task_submissions: 'task_submissions',
  announcements: 'announcements',
  announcements_targets: 'announcements_targets',
  announcement_reads: 'announcement_reads',
  events: 'events',
  event_targets: 'event_targets',
  conversations: 'conversations',
  messages: 'messages',
} as const

type IdModel = keyof typeof ID_MODELS

async function nextId(tx: TransactionClient, model: IdModel): Promise<bigint> {
  const table = ID_MODELS[model]
  const result = await tx.$queryRawUnsafe<Array<{ max: bigint | null }>>(
    `SELECT MAX(id) as max FROM "${table}"`,
  )
  const max = result[0]?.max
  return (max ?? BigInt(0)) + BigInt(1)
}

function calculateAverage(n1: number, n2: number, n3: number, n4: number): number {
  return Math.round(((n1 + n2 + n3 + n4) / 4) * 100) / 100
}

function clampGrade(value: number): number {
  return Math.min(10, Math.max(0, Math.round(value * 100) / 100))
}

function deterministicGrades(studentId: bigint, subjectIndex: number): {
  n1: number
  n2: number
  n3: number
  n4: number
} {
  const seed = Number(studentId) + subjectIndex * 17
  const base = 5 + (seed % 4)
  return {
    n1: clampGrade(base + (seed % 3)),
    n2: clampGrade(base + 1),
    n3: clampGrade(base + (seed % 2)),
    n4: clampGrade(base),
  }
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

  return tx.users.create({
    data: {
      id: await nextId(tx, 'users'),
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
        id: await nextId(tx, 'academic_years'),
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
  let bimesterId = await nextId(tx, 'bimesters')

  for (const number of [1, 2, 3, 4]) {
    if (existingNumbers.has(number)) {
      continue
    }

    await tx.bimesters.create({
      data: {
        id: bimesterId,
        number,
        status: number === 1 ? 'ABERTO' : 'FECHADO',
        year_id: academicYear.id,
      },
    })

    bimesterId += BigInt(1)
  }

  return { id: academicYear.id, year: ACADEMIC_YEAR }
}

async function ensureBnccSubjects(tx: TransactionClient): Promise<Map<string, bigint>> {
  const subjectIds = new Map<string, bigint>()

  for (const subject of BNCC_SUBJECTS) {
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
        id: await nextId(tx, 'subjects'),
        name: subject.name,
        description: subject.description,
      },
      select: { id: true },
    })

    subjectIds.set(subject.name, created.id)
  }

  return subjectIds
}

async function ensureBnccTeachers(
  tx: TransactionClient,
  hashedPassword: string,
  now: Date,
): Promise<Map<string, TeacherRecord>> {
  const teachersBySubject = new Map<string, TeacherRecord>()

  for (const teacherData of BNCC_TEACHERS) {
    const user = await upsertUser(
      tx,
      teacherData.email,
      'PROFESSOR',
      hashedPassword,
      now,
    )

    const existingTeacher =
      (await tx.teachers.findUnique({
        where: { user_id: user.id },
        select: { id: true },
      })) ??
      (await tx.teachers.findUnique({
        where: { registration_code: teacherData.registration_code },
        select: { id: true },
      }))

    const teacher = existingTeacher
      ? await tx.teachers.update({
          where: { id: existingTeacher.id },
          data: {
            user_id: user.id,
            full_name: teacherData.full_name,
            registration_code: teacherData.registration_code,
          },
          select: { id: true },
        })
      : await tx.teachers.create({
          data: {
            id: await nextId(tx, 'teachers'),
            user_id: user.id,
            full_name: teacherData.full_name,
            registration_code: teacherData.registration_code,
          },
          select: { id: true },
        })

    teachersBySubject.set(teacherData.subject, {
      teacherId: teacher.id,
      userId: user.id,
      email: teacherData.email,
      full_name: teacherData.full_name,
    })
  }

  return teachersBySubject
}

async function ensureClass(
  tx: TransactionClient,
  yearId: bigint,
  config: ClassSeedConfig,
): Promise<{ id: bigint }> {
  const existing = await tx.classes.findFirst({
    where: {
      year_id: yearId,
      education_level: config.education_level,
      series: config.series,
      letter: config.letter,
      shift: config.shift,
    },
    select: { id: true },
  })

  if (existing) {
    await tx.classes.update({
      where: { id: existing.id },
      data: { is_active: true },
    })
    return existing
  }

  return tx.classes.create({
    data: {
      id: await nextId(tx, 'classes'),
      year_id: yearId,
      education_level: config.education_level,
      series: config.series,
      letter: config.letter,
      shift: config.shift,
      is_active: true,
    },
    select: { id: true },
  })
}

async function ensureStudentsInClass(
  tx: TransactionClient,
  classId: bigint,
  students: SeedStudent[],
  hashedPassword: string,
  now: Date,
): Promise<Map<string, StudentRecord>> {
  const records = new Map<string, StudentRecord>()

  for (const studentData of students) {
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
            id: await nextId(tx, 'students'),
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
      enrollmentId = await nextId(tx, 'enrollments')
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
      email: studentData.email,
      globalIndex: studentData.globalIndex,
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

  const id = await nextId(tx, 'assignments')

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

async function seedLessonsAndAttendance(
  tx: TransactionClient,
  assignmentId: bigint,
  subjectName: string,
  studentRecords: StudentRecord[],
  now: Date,
  options?: {
    totalLessons?: number
    absentByEmail?: Map<string, number[]>
  },
): Promise<void> {
  const topics = LESSON_TOPICS[subjectName] ?? [
    `Conteúdo de ${subjectName}`,
    `Revisão de ${subjectName}`,
  ]
  const totalLessons = options?.totalLessons ?? 8
  const absentByEmail = options?.absentByEmail ?? new Map<string, number[]>()
  const lessonIds: bigint[] = []

  for (let order = 1; order <= totalLessons; order += 1) {
    const existingLesson = await tx.lessons.findFirst({
      where: { assignment_id: assignmentId, lesson_order: order },
      select: { id: true },
    })

    if (existingLesson) {
      lessonIds.push(existingLesson.id)
      continue
    }

    const lessonDate = new Date(now)
    lessonDate.setDate(lessonDate.getDate() - (totalLessons - order) * 5)
    const topic = topics[(order - 1) % topics.length]

    const lessonId = await nextId(tx, 'lessons')
    await tx.lessons.create({
      data: {
        id: lessonId,
        assignment_id: assignmentId,
        date: lessonDate,
        lesson_order: order,
        content: `Aula ${order} — ${topic}`,
        created_at: now,
      },
    })
    lessonIds.push(lessonId)
  }

  let attendanceId = await nextId(tx, 'attendances')

  for (let index = 0; index < lessonIds.length; index += 1) {
    const lessonId = lessonIds[index]
    const lessonOrder = index + 1

    for (const record of studentRecords) {
      const absentOrders = absentByEmail.get(record.email) ?? []
      const status = absentOrders.includes(lessonOrder) ? 'ABSENT' : 'PRESENT'

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
          id: attendanceId,
          student_id: record.studentId,
          lesson_id: lessonId,
          status,
          created_at: now,
        },
      })
      attendanceId += BigInt(1)
    }
  }
}

async function upsertGrade(
  tx: TransactionClient,
  enrollmentId: bigint,
  assignmentId: bigint,
  bimesterId: bigint,
  grades: { n1: number; n2: number; n3: number; n4: number },
  now: Date,
): Promise<void> {
  const average = calculateAverage(grades.n1, grades.n2, grades.n3, grades.n4)

  await tx.grades.upsert({
    where: {
      enrollment_id_assignment_id_bimester_id: {
        enrollment_id: enrollmentId,
        assignment_id: assignmentId,
        bimester_id: bimesterId,
      },
    },
    update: {
      n1: grades.n1,
      n2: grades.n2,
      n3: grades.n3,
      n4: grades.n4,
      average,
      final_average: average,
    },
    create: {
      id: await nextId(tx, 'grades'),
      enrollment_id: enrollmentId,
      assignment_id: assignmentId,
      bimester_id: bimesterId,
      n1: grades.n1,
      n2: grades.n2,
      n3: grades.n3,
      n4: grades.n4,
      average,
      final_average: average,
      created_at: now,
    },
  })
}

async function seedLessonsAttendanceAndGrades(
  tx: TransactionClient,
  assignmentId: bigint,
  subjectName: string,
  studentRecords: StudentRecord[],
  bimesterId: bigint,
  totalStudents: number,
  now: Date,
): Promise<void> {
  const absentByEmail = new Map<string, number[]>()

  for (const record of studentRecords) {
    const profile = riskProfileForGlobalIndex(record.globalIndex, totalStudents)
    absentByEmail.set(
      record.email,
      absentLessonsForProfile(profile, LESSONS_PER_ASSIGNMENT),
    )
  }

  await seedLessonsAndAttendance(
    tx,
    assignmentId,
    subjectName,
    studentRecords,
    now,
    { totalLessons: LESSONS_PER_ASSIGNMENT, absentByEmail },
  )

  for (const record of studentRecords) {
    const profile = riskProfileForGlobalIndex(record.globalIndex, totalStudents)
    const grades = gradesForRiskProfile(profile)

    await upsertGrade(
      tx,
      record.enrollmentId,
      assignmentId,
      bimesterId,
      grades,
      now,
    )
  }
}

type TaskSeed = {
  title: string
  description: string
  daysOffset: number
  submissionRate: number
}

const TASKS_BY_SUBJECT: Record<string, TaskSeed[]> = {
  Matemática: [
    {
      title: 'Lista de exercícios — equações',
      description:
        'Resolva as questões 1 a 15 da apostila. Mostre os cálculos e entregue em PDF.',
      daysOffset: 10,
      submissionRate: 0.85,
    },
    {
      title: 'Trabalho em grupo — funções afins',
      description:
        'Elabore um relatório sobre aplicações de funções no cotidiano com gráficos.',
      daysOffset: -4,
      submissionRate: 0.65,
    },
  ],
  Português: [
    {
      title: 'Resumo do romance estudado',
      description: 'Entregue um resumo de até 2 páginas com citações do texto base.',
      daysOffset: 8,
      submissionRate: 0.9,
    },
    {
      title: 'Produção textual — artigo de opinião',
      description: 'Escreva um artigo sobre um tema social com introdução, argumentos e conclusão.',
      daysOffset: -2,
      submissionRate: 0.7,
    },
  ],
  Ciências: [
    {
      title: 'Relatório de laboratório',
      description: 'Descreva o experimento sobre células e inclua ilustrações.',
      daysOffset: 12,
      submissionRate: 0.8,
    },
  ],
  História: [
    {
      title: 'Linha do tempo — Brasil República',
      description: 'Monte uma linha do tempo com os principais eventos do período.',
      daysOffset: 14,
      submissionRate: 0.75,
    },
  ],
  Geografia: [
    {
      title: 'Mapa temático do Brasil',
      description: 'Produza um mapa com legenda sobre biomas e recursos naturais.',
      daysOffset: 9,
      submissionRate: 0.82,
    },
  ],
}

async function seedTasks(
  tx: TransactionClient,
  assignmentsBySubject: Map<string, bigint>,
  studentRecords: StudentRecord[],
  now: Date,
): Promise<void> {
  const allStudents = studentRecords

  for (const [subjectName, assignmentId] of assignmentsBySubject) {
    const taskSeeds = TASKS_BY_SUBJECT[subjectName]
    if (!taskSeeds) {
      continue
    }

    for (const taskSeed of taskSeeds) {
      const existingTask = await tx.tasks.findFirst({
        where: {
          assignment_id: assignmentId,
          title: taskSeed.title,
        },
        select: { id: true },
      })

      if (existingTask) {
        continue
      }

      const deadline = new Date(now)
      deadline.setDate(deadline.getDate() + taskSeed.daysOffset)

      const taskId = await nextId(tx, 'tasks')
      await tx.tasks.create({
        data: {
          id: taskId,
          assignment_id: assignmentId,
          title: taskSeed.title,
          description: taskSeed.description,
          status: 'OPEN',
          target_mode: 'ALL_CLASS',
          deadline,
          created_at: now,
        },
      })

      let targetId = await nextId(tx, 'task_targets')
      for (const student of allStudents) {
        const existingTarget = await tx.task_targets.findUnique({
          where: {
            task_id_student_id: {
              task_id: taskId,
              student_id: student.studentId,
            },
          },
        })

        if (!existingTarget) {
          await tx.task_targets.create({
            data: {
              id: targetId,
              task_id: taskId,
              student_id: student.studentId,
              created_at: now,
            },
          })
          targetId += BigInt(1)
        }
      }

      const submitCount = Math.floor(allStudents.length * taskSeed.submissionRate)
      let submissionId = await nextId(tx, 'task_submissions')

      for (let i = 0; i < submitCount; i += 1) {
        const student = allStudents[i]
        const submittedAt = new Date(deadline)
        submittedAt.setDate(submittedAt.getDate() - (i % 3))

        const isLate = submittedAt > deadline
        const status = isLate ? 'LATE' : 'SUBMITTED'

        const existingSubmission = await tx.task_submissions.findUnique({
          where: {
            task_id_student_id: {
              task_id: taskId,
              student_id: student.studentId,
            },
          },
        })

        if (existingSubmission) {
          continue
        }

        await tx.task_submissions.create({
          data: {
            id: submissionId,
            task_id: taskId,
            student_id: student.studentId,
            status,
            observation: status === 'LATE' ? 'Entrega após o prazo com justificativa.' : null,
            submitted_at: submittedAt,
            created_at: now,
          },
        })
        submissionId += BigInt(1)
      }
    }
  }
}

type AnnouncementSeed = {
  title: string
  message: string
  scope_type: string
  target_type: string
  creatorKey: 'secretaria' | string
  classTarget?: boolean
}

const ANNOUNCEMENT_SEEDS: AnnouncementSeed[] = [
  {
    title: 'Reforma do pátio e novas áreas de convivência',
    message:
      'A direção informa que as obras no pátio central seguem em andamento. Pedimos que os alunos utilizem a entrada lateral durante o período de adaptação. A previsão de conclusão é para o próximo mês.',
    scope_type: 'ALL_SCHOOL',
    target_type: 'ALL',
    creatorKey: 'secretaria',
  },
  {
    title: 'Calendário de avaliações do 1º bimestre',
    message:
      'Confira as datas das avaliações bimestrais publicadas no mural da secretaria. Os professores disponibilizarão os conteúdos de revisão em sala de aula e na plataforma.',
    scope_type: 'STUDENTS',
    target_type: 'CLASS',
    creatorKey: 'secretaria',
    classTarget: true,
  },
  {
    title: 'Leitura obrigatória — romance contemporâneo',
    message:
      'Alunos do 9º ano A: a leitura do romance indicado deve ser concluída até o fim do bimestre. O resumo será avaliado na aula de Português.',
    scope_type: 'STUDENTS',
    target_type: 'CLASS',
    creatorKey: 'Português',
    classTarget: true,
  },
  {
    title: 'Reunião pedagógica dos docentes',
    message:
      'Convocamos todos os professores para a reunião pedagógica na próxima quarta-feira, às 14h, na sala dos coordenadores.',
    scope_type: 'TEACHERS',
    target_type: 'ALL',
    creatorKey: 'secretaria',
  },
  {
    title: 'Simulado de Ciências — preparação',
    message:
      'Estudantes, revisem os capítulos de biologia e química indicados. O simulado ocorrerá na semana que vem com foco em ecologia e tabela periódica.',
    scope_type: 'STUDENTS',
    target_type: 'CLASS',
    creatorKey: 'Ciências',
    classTarget: true,
  },
]

async function seedAnnouncements(
  tx: TransactionClient,
  classId: bigint,
  secretariaUserId: bigint,
  teachersBySubject: Map<string, TeacherRecord>,
  now: Date,
): Promise<void> {
  for (const seed of ANNOUNCEMENT_SEEDS) {
    const existing = await tx.announcements.findFirst({
      where: { title: seed.title },
      select: { id: true },
    })

    if (existing) {
      continue
    }

    const creatorId =
      seed.creatorKey === 'secretaria'
        ? secretariaUserId
        : teachersBySubject.get(seed.creatorKey)?.userId ?? secretariaUserId

    const announcementId = await nextId(tx, 'announcements')
    await tx.announcements.create({
      data: {
        id: announcementId,
        creator_id: creatorId,
        title: seed.title,
        message: seed.message,
        status: 'ACTIVE',
        scope_type: seed.scope_type,
        target_type: seed.target_type,
        created_at: now,
      },
    })

    if (seed.classTarget) {
      await tx.announcements_targets.create({
        data: {
          id: await nextId(tx, 'announcements_targets'),
          announcement_id: announcementId,
          class_id: classId,
          student_id: null,
        },
      })
    }
  }
}

type EventSeed = {
  title: string
  description: string
  daysFromNow: number
  durationDays: number
  all_day: boolean
  scope_type: 'ALL_SCHOOL' | 'STUDENTS' | 'TEACHERS' | 'SPECIFIC_CLASSES'
  classTarget?: boolean
}

const EVENT_SEEDS: EventSeed[] = [
  {
    title: 'Reunião de pais e mestres',
    description:
      'Encontro com famílias para apresentação dos resultados do 1º bimestre e orientações pedagógicas.',
    daysFromNow: 12,
    durationDays: 0,
    all_day: true,
    scope_type: 'ALL_SCHOOL',
  },
  {
    title: 'Semana de provas bimestrais — 9º Ano A',
    description:
      'Período dedicado às avaliações do 1º bimestre para a turma do 9º Ano A.',
    daysFromNow: 18,
    durationDays: 4,
    all_day: true,
    scope_type: 'SPECIFIC_CLASSES',
    classTarget: true,
  },
  {
    title: 'Feira de Ciências da escola',
    description:
      'Exposição dos projetos experimentais desenvolvidos pelos estudantes do ensino fundamental.',
    daysFromNow: 25,
    durationDays: 1,
    all_day: true,
    scope_type: 'ALL_SCHOOL',
  },
  {
    title: 'Capacitação docente — BNCC',
    description: 'Formação continuada sobre competências gerais da BNCC para o corpo docente.',
    daysFromNow: 7,
    durationDays: 0,
    all_day: false,
    scope_type: 'TEACHERS',
  },
  {
    title: 'Dia do estudante — atividades culturais',
    description:
      'Programação especial com gincanas, apresentações artísticas e momentos de integração.',
    daysFromNow: 30,
    durationDays: 0,
    all_day: true,
    scope_type: 'STUDENTS',
  },
]

async function seedEvents(
  tx: TransactionClient,
  yearId: bigint,
  classId: bigint,
  secretariaUserId: bigint,
  now: Date,
): Promise<void> {
  for (const seed of EVENT_SEEDS) {
    const existing = await tx.events.findFirst({
      where: { title: seed.title, year_id: yearId },
      select: { id: true },
    })

    if (existing) {
      continue
    }

    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() + seed.daysFromNow)
    startDate.setHours(seed.all_day ? 0 : 14, 0, 0, 0)

    const endDate = new Date(startDate)
    if (seed.all_day) {
      endDate.setDate(endDate.getDate() + seed.durationDays)
    } else {
      endDate.setHours(17, 0, 0, 0)
    }

    const eventId = await nextId(tx, 'events')
    await tx.events.create({
      data: {
        id: eventId,
        creator_id: secretariaUserId,
        year_id: yearId,
        title: seed.title,
        description: seed.description,
        start_date: startDate,
        end_date: endDate,
        all_day: seed.all_day,
        status: 'ACTIVE',
        scope_type: seed.scope_type,
        created_at: now,
        updated_at: now,
      },
    })

    if (seed.classTarget) {
      await tx.event_targets.create({
        data: {
          id: await nextId(tx, 'event_targets'),
          event_id: eventId,
          class_id: classId,
        },
      })
    }
  }
}

async function seedConversations(
  tx: TransactionClient,
  studentRecords: Map<string, StudentRecord>,
  teachersBySubject: Map<string, TeacherRecord>,
  now: Date,
): Promise<void> {
  const studentList = [...studentRecords.values()]
  const alertStudent = studentList.find(
    (s) => riskProfileForGlobalIndex(s.globalIndex, SCHOOL_CLASSES.length * STUDENTS_PER_CLASS) === 'ALERTA',
  )
  const stableStudent = studentList.find(
    (s) => riskProfileForGlobalIndex(s.globalIndex, SCHOOL_CLASSES.length * STUDENTS_PER_CLASS) === 'ESTAVEL',
  )

  const conversationSeeds = [
    alertStudent && {
      studentEmail: alertStudent.email,
      subject: 'Matemática',
      messages: [
        {
          sender: 'student' as const,
          content:
            'Professor, estou com dificuldade nas equações. Posso fazer recuperação paralela?',
        },
        {
          sender: 'teacher' as const,
          content:
            'Vamos montar um plano de estudos. Traga suas listas de exercícios na próxima aula.',
        },
      ],
    },
    stableStudent && {
      studentEmail: stableStudent.email,
      subject: 'Português',
      messages: [
        {
          sender: 'student' as const,
          content: 'Professora, qual o prazo final para o resumo do romance?',
        },
        {
          sender: 'teacher' as const,
          content:
            'A entrega é na semana que vem. Lembre-se de incluir as citações com página.',
        },
      ],
    },
  ].filter(Boolean) as Array<{
    studentEmail: string
    subject: string
    messages: Array<{ sender: 'student' | 'teacher'; content: string }>
  }>

  for (const seed of conversationSeeds) {
    const student = studentRecords.get(seed.studentEmail)
    const teacher = teachersBySubject.get(seed.subject)

    if (!student || !teacher) {
      continue
    }

    const existingConversation = await tx.conversations.findUnique({
      where: {
        student_id_teacher_id: {
          student_id: student.studentId,
          teacher_id: teacher.teacherId,
        },
      },
      select: { id: true },
    })

    let conversationId: bigint

    if (existingConversation) {
      conversationId = existingConversation.id
    } else {
      conversationId = await nextId(tx, 'conversations')
      await tx.conversations.create({
        data: {
          id: conversationId,
          student_id: student.studentId,
          teacher_id: teacher.teacherId,
          created_at: now,
        },
      })
    }

    const existingMessages = await tx.messages.count({
      where: { conversation_id: conversationId },
    })

    if (existingMessages >= seed.messages.length) {
      continue
    }

    let messageId = await nextId(tx, 'messages')
    for (const message of seed.messages) {
      const senderId =
        message.sender === 'student'
          ? (await tx.students.findUnique({
              where: { id: student.studentId },
              select: { user_id: true },
            }))!.user_id
          : teacher.userId

      await tx.messages.create({
        data: {
          id: messageId,
          conversation_id: conversationId,
          sender_id: senderId,
          content: message.content,
          status: 'SENT',
          created_at: now,
        },
      })
      messageId += BigInt(1)
    }
  }
}

async function syncIdSequences(tx: TransactionClient) {
  const tables = Object.values(ID_MODELS)

  for (const table of tables) {
    await tx.$executeRawUnsafe(
      `SELECT setval('${table}_id_seq', COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false);`,
    )
  }
}

async function main() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)
  const now = new Date()
  const totalStudents = SCHOOL_CLASSES.length * STUDENTS_PER_CLASS

  await prisma.$transaction(
    async (tx) => {
      const secretaria = await upsertUser(
        tx,
        'admin@classon.com',
        'SECRETARIA',
        hashedPassword,
        now,
      )

      const academicYear = await ensureActiveAcademicYear(tx, now)
      const subjectIds = await ensureBnccSubjects(tx)
      const teachersBySubject = await ensureBnccTeachers(tx, hashedPassword, now)

      const bimester1 = await tx.bimesters.findFirst({
        where: { year_id: academicYear.id, number: 1 },
        select: { id: true },
      })

      if (!bimester1) {
        throw new Error('1º bimestre não encontrado para o ano letivo de demonstração.')
      }

      let primaryClassId: bigint | null = null
      let primaryClassStudents: StudentRecord[] = []
      let primaryAssignments = new Map<string, bigint>()

      for (let classIndex = 0; classIndex < SCHOOL_CLASSES.length; classIndex += 1) {
        const classConfig = SCHOOL_CLASSES[classIndex]
        const classRecord = await ensureClass(tx, academicYear.id, classConfig)
        const studentSeeds = buildStudentsForClass(classIndex)

        const studentRecords = await ensureStudentsInClass(
          tx,
          classRecord.id,
          studentSeeds,
          hashedPassword,
          now,
        )

        const studentRecordList = [...studentRecords.values()]
        const assignmentsBySubject = new Map<string, bigint>()

        for (const teacherData of BNCC_TEACHERS) {
          const subjectId = subjectIds.get(teacherData.subject)
          const teacher = teachersBySubject.get(teacherData.subject)

          if (!subjectId || !teacher) {
            throw new Error(`Disciplina ou professor não encontrado: ${teacherData.subject}`)
          }

          const assignment = await ensureAssignment(
            tx,
            teacher.teacherId,
            classRecord.id,
            subjectId,
            now,
          )
          assignmentsBySubject.set(teacherData.subject, assignment.id)
        }

        for (const subject of BNCC_SUBJECTS) {
          const assignmentId = assignmentsBySubject.get(subject.name)
          if (!assignmentId) {
            continue
          }

          await seedLessonsAttendanceAndGrades(
            tx,
            assignmentId,
            subject.name,
            studentRecordList,
            bimester1.id,
            totalStudents,
            now,
          )
        }

        if (classIndex === 0) {
          primaryClassId = classRecord.id
          primaryClassStudents = studentRecordList
          primaryAssignments = assignmentsBySubject
        }
      }

      if (primaryClassId && primaryClassStudents.length > 0) {
        await seedTasks(tx, primaryAssignments, primaryClassStudents, now)
        await seedAnnouncements(
          tx,
          primaryClassId,
          secretaria.id,
          teachersBySubject,
          now,
        )
        await seedEvents(tx, academicYear.id, primaryClassId, secretaria.id, now)
        await seedConversations(
          tx,
          new Map(primaryClassStudents.map((record) => [record.email, record])),
          teachersBySubject,
          now,
        )
      }

      await syncIdSequences(tx)
    },
    { timeout: 600_000, maxWait: 60_000 },
  )

  console.log('Seed BNCC de demonstração concluído com sucesso.')
  console.log('')
  console.log('Contas de acesso (senha: 123456):')
  console.log('  Secretaria: admin@classon.com')
  console.log('  Professores:')
  for (const teacher of BNCC_TEACHERS) {
    console.log(`    ${teacher.subject.padEnd(18)} ${teacher.email} (${teacher.full_name})`)
  }
  console.log(`  Alunos:     aluno0001@classon.com … aluno${String(totalStudents).padStart(4, '0')}@classon.com`)
  console.log('')
  console.log(
    `Cenário: Ano ${ACADEMIC_YEAR} · ${SCHOOL_CLASSES.length} turmas · ${totalStudents} alunos · ${BNCC_SUBJECTS.length} disciplinas BNCC`,
  )
  console.log('Distribuição preditiva: ~70% Estável · ~20% Alerta · ~10% Risco Crítico')
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
