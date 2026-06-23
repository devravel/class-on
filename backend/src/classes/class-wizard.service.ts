import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { fakerPT_BR as faker } from '@faker-js/faker'
import * as bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { validateSeriesForEducationLevel } from './class-series.validation'
import { CreateClassWizardDto } from './dto/create-class-wizard.dto'
import { WizardManualStudentDto } from './dto/wizard-manual-student.dto'

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  is_active: true,
  created_at: true,
} as const

const CLASS_INCLUDE = {
  academic_years: true,
} as const

const WIZARD_TRANSACTION_OPTIONS = {
  timeout: 120_000,
  maxWait: 10_000,
} as const

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>

type PreparedStudent = {
  full_name: string
  email: string
  rm: string
  provisional_password: string
  hashed_password: string
}

type TeacherAssignmentPlan = {
  teacher_id: bigint
  subject_id: bigint
}

@Injectable()
export class ClassWizardService {
  constructor(private readonly prisma: PrismaService) {}

  async createWizard(dto: CreateClassWizardDto) {
    try {
      this.validateStudentInput(dto)

      const yearId = BigInt(dto.year_id)
      validateSeriesForEducationLevel(dto.series, dto.education_level)

      const academicYear = await this.prisma.academic_years.findUnique({
        where: { id: yearId },
      })

      if (!academicYear) {
        throw new NotFoundException('Registro não encontrado')
      }

      await this.ensureUniqueClassIdentity(
        yearId,
        dto.education_level,
        dto.series,
        dto.letter,
        dto.shift,
      )

      const teacherIds = (dto.teacher_ids ?? []).map((id) => BigInt(id))
      await this.validateTeachers(teacherIds)

      const manualStudents = dto.manual_students ?? []
      if (manualStudents.length > 0) {
        await this.validateManualStudents(manualStudents)
      }

      const bulkCount = dto.bulk_student_count ?? 0
      const totalNewStudents = manualStudents.length + bulkCount

      const existingNames = await this.loadExistingStudentNames()
      const bulkStudents = this.generateBulkStudents(
        bulkCount,
        academicYear.year,
        existingNames,
      )

      const assignmentPlans = await this.planTeacherAssignments(teacherIds)
      const preparedManualStudents =
        await this.prepareManualStudents(manualStudents)
      const preparedBulkStudents = await this.prepareBulkStudents(
        bulkStudents,
        academicYear.year,
      )
      const preparedStudents = [
        ...preparedManualStudents,
        ...preparedBulkStudents,
      ]

      const result = await this.prisma.$transaction(async (tx) => {
        const now = new Date()

        const classRecord = await tx.classes.create({
          data: {
            year_id: yearId,
            education_level: dto.education_level,
            series: dto.series,
            letter: dto.letter,
            shift: dto.shift,
          },
          include: CLASS_INCLUDE,
        })

        const assignments = await this.createAssignmentsFromPlan(
          tx,
          assignmentPlans,
          classRecord.id,
          now,
        )

        const createdStudents = []

        for (const student of preparedStudents) {
          const created = await this.insertStudentWithEnrollment(tx, {
            full_name: student.full_name,
            email: student.email,
            rm: student.rm,
            hashed_password: student.hashed_password,
            classId: classRecord.id,
            now,
          })

          createdStudents.push({
            student: created,
            provisional_password: student.provisional_password,
          })
        }

        return {
          class: classRecord,
          assignments,
          students: createdStudents,
          summary: {
            assignments_created: assignments.length,
            students_created: totalNewStudents,
            teachers_assigned: teacherIds.length,
          },
        }
      }, WIZARD_TRANSACTION_OPTIONS)

      return result
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private validateStudentInput(dto: CreateClassWizardDto) {
    const hasManual = (dto.manual_students?.length ?? 0) > 0
    const hasBulk = (dto.bulk_student_count ?? 0) > 0

    if (hasManual && hasBulk) {
      throw new BadRequestException(
        'Informe apenas cadastro manual ou cadastro em lote, não ambos.',
      )
    }
  }

  private async ensureUniqueClassIdentity(
    yearId: bigint,
    educationLevel: string,
    series: number,
    letter: string,
    shift: string,
  ) {
    const existing = await this.prisma.classes.findFirst({
      where: {
        year_id: yearId,
        education_level: educationLevel,
        series,
        letter,
        shift,
      },
    })

    if (existing) {
      throw new BadRequestException('Já existe um registro com esses dados')
    }
  }

  private async validateTeachers(teacherIds: bigint[]) {
    if (teacherIds.length === 0) {
      return
    }

    const uniqueIds = [...new Set(teacherIds.map((id) => id.toString()))].map(
      (id) => BigInt(id),
    )

    if (uniqueIds.length !== teacherIds.length) {
      throw new BadRequestException(
        'A lista de professores contém IDs duplicados',
      )
    }

    const teachers = await this.prisma.teachers.findMany({
      where: { id: { in: uniqueIds } },
      include: {
        users: {
          select: { is_active: true },
        },
      },
    })

    if (teachers.length !== uniqueIds.length) {
      throw new NotFoundException('Professor não encontrado')
    }

    const inactive = teachers.filter((teacher) => !teacher.users.is_active)
    if (inactive.length > 0) {
      throw new BadRequestException(
        'Apenas professores ativos podem ser atribuídos à turma',
      )
    }
  }

  private async validateManualStudents(students: WizardManualStudentDto[]) {
    const emails = students.map((s) => s.email.toLowerCase())
    const rms = students.map((s) => s.rm.toUpperCase())

    const duplicateEmails = emails.filter(
      (email, index) => emails.indexOf(email) !== index,
    )
    const duplicateRms = rms.filter((rm, index) => rms.indexOf(rm) !== index)

    if (duplicateEmails.length > 0 || duplicateRms.length > 0) {
      throw new BadRequestException(
        'Existem e-mails ou RMs duplicados na lista de alunos',
      )
    }

    const existingUsers = await this.prisma.users.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    })

    const existingStudents = await this.prisma.students.findMany({
      where: { rm: { in: rms } },
      select: { rm: true },
    })

    if (existingUsers.length > 0 || existingStudents.length > 0) {
      const existingEmails = existingUsers.map((u) => u.email)
      const existingRms = existingStudents.map((s) => s.rm)
      throw new BadRequestException(
        `Os seguintes dados já existem no sistema - E-mails: ${existingEmails.join(', ')} | RMs: ${existingRms.join(', ')}`,
      )
    }
  }

  private async loadExistingStudentNames(): Promise<Set<string>> {
    const students = await this.prisma.students.findMany({
      select: { full_name: true },
    })

    return new Set(students.map((s) => s.full_name.trim().toLowerCase()))
  }

  private generateBulkStudents(
    count: number,
    academicYear: number,
    existingNames: Set<string>,
  ): Array<{ full_name: string }> {
    if (count === 0) {
      return []
    }

    const batchNames = new Set<string>()
    const students: Array<{ full_name: string }> = []

    for (let i = 0; i < count; i++) {
      const full_name = this.generateUniqueBrazilianName(existingNames, batchNames)
      const normalized = full_name.trim().toLowerCase()
      batchNames.add(normalized)
      existingNames.add(normalized)
      students.push({ full_name })
    }

    return students
  }

  private generateUniqueBrazilianName(
    existingNames: Set<string>,
    batchNames: Set<string>,
  ): string {
    for (let attempt = 0; attempt < 100; attempt++) {
      const name = faker.person.fullName().trim()
      const normalized = name.toLowerCase()

      if (!existingNames.has(normalized) && !batchNames.has(normalized)) {
        return name
      }
    }

    throw new BadRequestException(
      'Não foi possível gerar nomes únicos para o lote de alunos',
    )
  }

  private async prepareManualStudents(
    students: WizardManualStudentDto[],
  ): Promise<PreparedStudent[]> {
    const prepared: PreparedStudent[] = []

    for (const student of students) {
      const provisional_password = this.generateProvisionalPassword()
      const hashed_password = await bcrypt.hash(provisional_password, 10)

      prepared.push({
        full_name: student.full_name,
        email: student.email.toLowerCase(),
        rm: student.rm.toUpperCase(),
        provisional_password,
        hashed_password,
      })
    }

    return prepared
  }

  private async prepareBulkStudents(
    students: Array<{ full_name: string }>,
    academicYear: number,
  ): Promise<PreparedStudent[]> {
    if (students.length === 0) {
      return []
    }

    let nextSequence = await this.getNextRmSequence(academicYear)
    const prepared: PreparedStudent[] = []

    for (const student of students) {
      const { rm, email } = await this.reserveNextRmAndEmail(
        academicYear,
        nextSequence,
      )
      nextSequence = Number(rm.slice(String(academicYear).length)) + 1

      const provisional_password = this.generateProvisionalPassword()
      const hashed_password = await bcrypt.hash(provisional_password, 10)

      prepared.push({
        full_name: student.full_name,
        email,
        rm,
        provisional_password,
        hashed_password,
      })
    }

    return prepared
  }

  private async planTeacherAssignments(
    teacherIds: bigint[],
  ): Promise<TeacherAssignmentPlan[]> {
    if (teacherIds.length === 0) {
      return []
    }

    const plans: TeacherAssignmentPlan[] = []

    for (const teacherId of teacherIds) {
      const existingAssignments = await this.prisma.assignments.findMany({
        where: { teacher_id: teacherId },
        select: { subject_id: true },
      })

      const subjectIds = [
        ...new Set(existingAssignments.map((assignment) => assignment.subject_id)),
      ]

      for (const subjectId of subjectIds) {
        plans.push({ teacher_id: teacherId, subject_id: subjectId })
      }
    }

    return plans
  }

  private formatRm(academicYear: number, sequence: number): string {
    return `${academicYear}${String(sequence).padStart(4, '0')}`
  }

  private buildStudentEmail(rm: string): string {
    return `${rm.toLowerCase()}@classon.com`
  }

  private async reserveNextRmAndEmail(
    academicYear: number,
    startSequence: number,
  ): Promise<{ rm: string; email: string }> {
    let sequence = startSequence

    for (let attempt = 0; attempt < 1000; attempt++) {
      const rm = this.formatRm(academicYear, sequence)
      const email = this.buildStudentEmail(rm)

      const [existingStudent, existingUser] = await Promise.all([
        this.prisma.students.findUnique({ where: { rm }, select: { id: true } }),
        this.prisma.users.findUnique({ where: { email }, select: { id: true } }),
      ])

      if (!existingStudent && !existingUser) {
        return { rm, email }
      }

      sequence += 1
    }

    throw new BadRequestException(
      'Não foi possível reservar RMs sequenciais disponíveis',
    )
  }

  private async getNextRmSequence(academicYear: number): Promise<number> {
    const prefix = String(academicYear)
    const pattern = new RegExp(`^${prefix}\\d{4}$`)

    const students = await this.prisma.students.findMany({
      where: {
        rm: {
          startsWith: prefix,
        },
      },
      select: { rm: true },
    })

    let maxSequence = 0

    for (const student of students) {
      if (!pattern.test(student.rm)) {
        continue
      }

      const sequence = Number(student.rm.slice(prefix.length))
      if (Number.isInteger(sequence) && sequence > maxSequence) {
        maxSequence = sequence
      }
    }

    return maxSequence + 1
  }

  private async createAssignmentsFromPlan(
    tx: TransactionClient,
    plans: TeacherAssignmentPlan[],
    classId: bigint,
    now: Date,
  ) {
    const created = []

    for (const plan of plans) {
      const assignment = await tx.assignments.create({
        data: {
          teacher_id: plan.teacher_id,
          class_id: classId,
          subject_id: plan.subject_id,
          created_at: now,
        },
        include: {
          teachers: {
            select: {
              id: true,
              full_name: true,
              registration_code: true,
            },
          },
          subjects: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      created.push(assignment)
    }

    return created
  }

  private async insertStudentWithEnrollment(
    tx: TransactionClient,
    params: {
      full_name: string
      email: string
      rm: string
      hashed_password: string
      classId: bigint
      now: Date
    },
  ) {
    const user = await tx.users.create({
      data: {
        email: params.email,
        password: params.hashed_password,
        role: 'ALUNO',
        is_active: true,
        created_at: params.now,
      },
    })

    const student = await tx.students.create({
      data: {
        user_id: user.id,
        full_name: params.full_name,
        rm: params.rm,
        status: 'ACTIVE',
      },
      include: { users: { select: USER_SELECT } },
    })

    await tx.enrollments.create({
      data: {
        student_id: student.id,
        class_id: params.classId,
        final_result: 'IN_PROGRESS',
        created_at: params.now,
      },
    })

    return student
  }

  private generateProvisionalPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let suffix = ''
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `Aluno@${suffix}`
  }
}
