import { GraduationCap } from 'lucide-react'
import Link from 'next/link'

import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ClassStudentAttendanceSummary } from '@/types/attendance'
import { ClassDetailsEnrollment } from '@/types/class'

interface ClassStudentsListProps {
  classId: string
  enrollments: ClassDetailsEnrollment[]
  attendanceByStudentId: Map<string, ClassStudentAttendanceSummary>
}

export function ClassStudentsList({
  classId,
  enrollments,
  attendanceByStudentId,
}: ClassStudentsListProps) {
  return (
    <Section
      title="Alunos"
      description="Alunos matriculados nesta turma, em ordem alfabética"
    >
      <ListCard
        items={enrollments}
        emptyMessage="Nenhum aluno matriculado nesta turma."
        renderItem={(enrollment) => {
          const student = enrollment.students
          const attendance = attendanceByStudentId.get(student.id)
          const generalRate = attendance?.general_attendance_rate ?? 0
          const isHealthy = generalRate >= 75

          return (
            <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
                  <GraduationCap size={18} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-text-primary">
                    {student.full_name}
                  </p>
                  <p className="truncate text-sm text-text-secondary">
                    {student.users.email}
                    {' · '}
                    RM: {student.rm}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Frequência geral:{' '}
                    <span
                      className={cn(
                        'font-medium',
                        isHealthy ? 'text-success' : 'text-danger',
                      )}
                    >
                      {generalRate.toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>

              <Link
                href={`/secretaria/turmas/${classId}/alunos/${student.id}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                Ver Desempenho
              </Link>
            </div>
          )
        }}
      />
    </Section>
  )
}
