import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'

export type RiskCategory = 'RISCO_CRITICO' | 'ALERTA' | 'ESTAVEL'

export interface StudentRiskEntry {
  id: string
  full_name: string
  rm: string
  score: number
  grade_average: number | null
  attendance_rate: number | null
  category: RiskCategory
}

export interface RiskAnalyticsResponse {
  year: number | null
  counts: {
    risco_critico: number
    alerta: number
    estavel: number
  }
  students: {
    risco_critico: StudentRiskEntry[]
    alerta: StudentRiskEntry[]
    estavel: StudentRiskEntry[]
  }
  total: number
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRiskAnalytics(teacherId?: bigint): Promise<RiskAnalyticsResponse> {
    try {
      const activeYear = await this.prisma.academic_years.findFirst({
        where: { status: 'ACTIVE' },
        select: { id: true, year: true },
      })

      if (!activeYear) {
        return this.emptyResponse(null)
      }

      const students = await this.prisma.students.findMany({
        where: {
          enrollments: {
            some: {
              classes: {
                year_id: activeYear.id,
                ...(teacherId !== undefined && {
                  assignments: {
                    some: { teacher_id: teacherId },
                  },
                }),
              },
            },
          },
        },
        select: {
          id: true,
          full_name: true,
          rm: true,
          enrollments: {
            where: {
              classes: {
                year_id: activeYear.id,
                ...(teacherId !== undefined && {
                  assignments: {
                    some: { teacher_id: teacherId },
                  },
                }),
              },
            },
            select: {
              grades: {
                where: {
                  ...(teacherId !== undefined && {
                    assignments: { teacher_id: teacherId },
                  }),
                },
                select: {
                  average: true,
                  final_average: true,
                },
              },
            },
          },
          attendances: {
            where: {
              lessons: {
                assignments: {
                  classes: { year_id: activeYear.id },
                  ...(teacherId !== undefined && { teacher_id: teacherId }),
                },
              },
            },
            select: { status: true },
          },
        },
        orderBy: { full_name: 'asc' },
      })

      const riscoCritico: StudentRiskEntry[] = []
      const alerta: StudentRiskEntry[] = []
      const estavel: StudentRiskEntry[] = []

      for (const student of students) {
        const entry = this.computeStudentRisk(student)
        if (entry.category === 'RISCO_CRITICO') {
          riscoCritico.push(entry)
        } else if (entry.category === 'ALERTA') {
          alerta.push(entry)
        } else {
          estavel.push(entry)
        }
      }

      return {
        year: activeYear.year,
        counts: {
          risco_critico: riscoCritico.length,
          alerta: alerta.length,
          estavel: estavel.length,
        },
        students: {
          risco_critico: riscoCritico,
          alerta,
          estavel,
        },
        total: students.length,
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private computeStudentRisk(student: {
    id: bigint
    full_name: string
    rm: string
    enrollments: Array<{
      grades: Array<{
        average: { toNumber?: () => number } | number
        final_average: { toNumber?: () => number } | number | null
      }>
    }>
    attendances: Array<{ status: string }>
  }): StudentRiskEntry {
    const allGrades = student.enrollments.flatMap((e) => e.grades)

    let gradeAverage: number | null = null
    if (allGrades.length > 0) {
      const sum = allGrades.reduce((acc, g) => {
        const value = g.final_average ?? g.average
        return acc + this.toNumber(value)
      }, 0)
      gradeAverage = Math.round((sum / allGrades.length) * 100) / 100
    }

    let attendanceRate: number | null = null
    const totalAttendances = student.attendances.length
    if (totalAttendances > 0) {
      const present = student.attendances.filter(
        (a) => a.status === 'PRESENT',
      ).length
      attendanceRate =
        Math.round((present / totalAttendances) * 100 * 100) / 100
    }

    let score = 0

    if (gradeAverage !== null && gradeAverage < 6.0) {
      score += 40
    }

    if (attendanceRate !== null) {
      if (attendanceRate < 75) {
        score += 50
      } else if (attendanceRate < 85) {
        score += 20
      }
    }

    let category: RiskCategory
    if (score > 60) {
      category = 'RISCO_CRITICO'
    } else if (score >= 20) {
      category = 'ALERTA'
    } else {
      category = 'ESTAVEL'
    }

    return {
      id: student.id.toString(),
      full_name: student.full_name,
      rm: student.rm,
      score,
      grade_average: gradeAverage,
      attendance_rate: attendanceRate,
      category,
    }
  }

  private toNumber(value: { toNumber?: () => number } | number | null): number {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') return value
    if (typeof value.toNumber === 'function') return value.toNumber()
    return Number(value)
  }

  private emptyResponse(year: number | null): RiskAnalyticsResponse {
    return {
      year,
      counts: { risco_critico: 0, alerta: 0, estavel: 0 },
      students: { risco_critico: [], alerta: [], estavel: [] },
      total: 0,
    }
  }
}
