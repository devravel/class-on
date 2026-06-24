'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderTitle } from '@/contexts/page-header-context'
import { StudentPerformanceView } from '@/components/students/StudentPerformanceView'
import { buttonVariants } from '@/components/ui/button'
import { attendanceApi, classesApi, gradesApi, studentsApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ClassDetails } from '@/types/class'
import { Student } from '@/types/student'

export default function TurmaAlunoDesempenhoPage() {
  const params = useParams<{ id: string; studentId: string }>()
  const classId = params.id
  const studentId = params.studentId

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [grades, setGrades] = useState<Awaited<ReturnType<typeof gradesApi.getByStudent>>>([])
  const [generalAttendanceRate, setGeneralAttendanceRate] = useState(0)
  const [disciplineAttendance, setDisciplineAttendance] = useState<
    Awaited<ReturnType<typeof attendanceApi.getStudentSummary>>['discipline_attendance']
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [details, studentData, gradesData, attendanceData] = await Promise.all([
          classesApi.getDetails(classId),
          studentsApi.getById(studentId),
          gradesApi.getByStudent(studentId),
          attendanceApi.getStudentSummary(studentId, classId),
        ])

        const isEnrolled = details.enrollments.some(
          (enrollment) => enrollment.students.id === studentId,
        )

        if (!isEnrolled) {
          setError('Este aluno não está matriculado nesta turma.')
          return
        }

        setClassDetails(details)
        setStudent(studentData)
        setGrades(Array.isArray(gradesData) ? gradesData : [])
        setGeneralAttendanceRate(attendanceData.general_attendance_rate ?? 0)
        setDisciplineAttendance(attendanceData.discipline_attendance ?? [])
      } catch {
        setError('Não foi possível carregar o desempenho do aluno.')
      } finally {
        setIsLoading(false)
      }
    }

    if (classId && studentId) {
      load()
    }
  }, [classId, studentId])

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    )
  }

  if (error || !student || !classDetails) {
    return (
      <PageContainer>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error ?? 'Aluno não encontrado.'}
        </div>
      </PageContainer>
    )
  }

  const assignmentIds = classDetails.assignments.map((assignment) => assignment.id)

  return (
    <PageContainer>
      <PageHeaderTitle title="Desempenho do Aluno" />
      <div className="mb-8 flex items-start gap-3">
        <Link
          href={`/secretaria/turmas/${classId}`}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'icon' }),
            'mt-0.5 shrink-0',
          )}
          aria-label="Voltar para detalhes da turma"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-sm text-text-secondary">
            Notas, frequência e situação por disciplina
          </p>
        </div>
      </div>

      <StudentPerformanceView
        studentName={student.full_name}
        studentRm={student.rm}
        studentEmail={student.users.email}
        generalAttendanceRate={generalAttendanceRate}
        disciplineAttendance={disciplineAttendance ?? []}
        grades={grades}
        assignmentIds={assignmentIds}
      />
    </PageContainer>
  )
}
