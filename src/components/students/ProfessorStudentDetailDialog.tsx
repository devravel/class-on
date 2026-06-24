'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { StudentPerformanceView } from '@/components/students/StudentPerformanceView'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { attendanceApi, gradesApi, studentsApi } from '@/lib/api'

interface ProfessorStudentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string | null
  assignmentId: string | null
  classId: string | null
  subjectName?: string
}

export function ProfessorStudentDetailDialog({
  open,
  onOpenChange,
  studentId,
  assignmentId,
  classId,
  subjectName,
}: ProfessorStudentDetailDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [studentName, setStudentName] = useState('')
  const [studentRm, setStudentRm] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [generalAttendanceRate, setGeneralAttendanceRate] = useState(0)
  const [disciplineAttendance, setDisciplineAttendance] = useState<
    Awaited<ReturnType<typeof attendanceApi.getStudentSummary>>['discipline_attendance']
  >([])
  const [grades, setGrades] = useState<Awaited<ReturnType<typeof gradesApi.getByStudent>>>([])

  useEffect(() => {
    if (!open || !studentId || !assignmentId || !classId) {
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [studentData, gradesData, attendanceData] = await Promise.all([
          studentsApi.getById(studentId),
          gradesApi.getByStudent(studentId),
          attendanceApi.getStudentSummary(studentId, classId),
        ])

        if (cancelled) return

        setStudentName(studentData.full_name)
        setStudentRm(studentData.rm)
        setStudentEmail(studentData.users.email)
        setGrades(Array.isArray(gradesData) ? gradesData : [])

        const disciplineEntry = (attendanceData.discipline_attendance ?? []).find(
          (entry) => entry.assignment_id === assignmentId,
        )

        setDisciplineAttendance(disciplineEntry ? [disciplineEntry] : [])
        setGeneralAttendanceRate(disciplineEntry?.attendance_rate ?? 0)
      } catch {
        if (!cancelled) {
          setError('Não foi possível carregar os dados do aluno.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [open, studentId, assignmentId, classId])

  const scopedAssignmentIds = useMemo(
    () => (assignmentId ? [assignmentId] : []),
    [assignmentId],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Aluno</DialogTitle>
          <DialogDescription>
            {subjectName
              ? `Desempenho em ${subjectName} — visão do professor`
              : 'Desempenho na disciplina atribuída'}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <StudentPerformanceView
            studentName={studentName}
            studentRm={studentRm}
            studentEmail={studentEmail}
            generalAttendanceRate={generalAttendanceRate}
            disciplineAttendance={disciplineAttendance ?? []}
            grades={grades}
            assignmentIds={scopedAssignmentIds}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
