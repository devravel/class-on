'use client'

import {
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ClipboardList,
  GraduationCap,
  ListTodo,
  Loader2,
  Plus,
  Save,
  Sparkles,
  UserCheck,
  UserX,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { PageContainer } from '@/components/layout/PageContainer'
import { usePageHeaderTitle } from '@/contexts/page-header-context'
import { AiTaskGeneratorModal } from '@/components/ai/AiTaskGeneratorModal'
import { MarkdownContent } from '@/components/ai/MarkdownContent'
import { ProfessorStudentDetailDialog } from '@/components/students/ProfessorStudentDetailDialog'
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  assignmentsApi,
  aiApi,
  attendanceApi,
  bimestersApi,
  gradesApi,
  lessonsApi,
  tasksApi,
} from '@/lib/api'
import {
  calculateAverage,
  formatDateForInput,
  getClassLabel,
  parseGradeValue,
} from '@/lib/class-utils'
import { cn } from '@/lib/utils'
import { Assignment } from '@/types/assignment'
import { AttendanceStatus } from '@/types/attendance'
import { Bimester } from '@/types/bimester'
import { GradeRow } from '@/types/grade'
import { Lesson } from '@/types/lesson'
import { Task } from '@/types/task'

type TabId = 'diario' | 'notas' | 'tarefas' | 'alunos'

function resolveTabFromParam(value: string | null): TabId {
  if (value === 'notas') return 'notas'
  if (value === 'tarefas' || value === 'tarefa') return 'tarefas'
  if (value === 'alunos') return 'alunos'
  if (value === 'diario' || value === 'chamada') return 'diario'
  return 'diario'
}

const TABS: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: 'diario', label: 'Diário de Classe', icon: BookOpen },
  { id: 'notas', label: 'Lançamento de Notas', icon: ClipboardList },
  { id: 'tarefas', label: 'Tarefas', icon: ListTodo },
  { id: 'alunos', label: 'Alunos', icon: GraduationCap },
]

interface GradeFormRow {
  enrollmentId: string
  studentId: string
  studentName: string
  studentRm: string
  gradeId: string | null
  n1: string
  n2: string
  n3: string
  n4: string
  recovery: string
}

function toGradeFormRow(row: GradeRow): GradeFormRow {
  const grade = row.grade
  return {
    enrollmentId: row.enrollment.id,
    studentId: row.enrollment.student.id,
    studentName: row.enrollment.student.full_name,
    studentRm: row.enrollment.student.rm,
    gradeId: grade?.id ?? null,
    n1: grade ? String(parseGradeValue(grade.n1)) : '',
    n2: grade ? String(parseGradeValue(grade.n2)) : '',
    n3: grade ? String(parseGradeValue(grade.n3)) : '',
    n4: grade ? String(parseGradeValue(grade.n4)) : '',
    recovery: grade?.recovery_grade != null ? String(parseGradeValue(grade.recovery_grade)) : '',
  }
}

interface TurmaDetailPageProps {
  assignmentId: string
}

export default function TurmaDetailPage({ assignmentId }: TurmaDetailPageProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    resolveTabFromParam(searchParams.get('tab')),
  )
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setActiveTab(resolveTabFromParam(searchParams.get('tab')))
  }, [searchParams])

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await assignmentsApi.getById(assignmentId)
        setAssignment(data)
      } catch {
        setError('Não foi possível carregar os dados da turma.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [assignmentId])

  const headerTitle = assignment ? getClassLabel(assignment.classes) : ''
  usePageHeaderTitle(headerTitle)

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    )
  }

  if (error || !assignment) {
    return (
      <PageContainer>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
          {error ?? 'Turma não encontrada.'}
        </div>
        <Link href="/professor/turmas" className="link-action mt-4 inline-flex text-sm">
          ← Voltar para Minhas Turmas
        </Link>
      </PageContainer>
    )
  }

  const classLabel = getClassLabel(assignment.classes)

  return (
    <PageContainer>
      <div className="mb-6">
        <Link
          href="/professor/turmas"
          className="nav-item-light mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft size={16} />
          Minhas Turmas
        </Link>
        <p className="text-sm text-text-secondary">
          {assignment.subjects.name} · Ano Letivo {assignment.classes.academic_years.year}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-b-2 border-primary bg-primary/5 text-primary'
                  : 'nav-item-light',
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'diario' && (
        <DiarioTab assignmentId={assignmentId} assignment={assignment} />
      )}
      {activeTab === 'notas' && (
        <NotasTab assignmentId={assignmentId} assignment={assignment} />
      )}
      {activeTab === 'tarefas' && (
        <TarefasTab assignmentId={assignmentId} assignment={assignment} />
      )}
      {activeTab === 'alunos' && (
        <AlunosTab assignmentId={assignmentId} assignment={assignment} />
      )}
    </PageContainer>
  )
}

function DiarioTab({
  assignmentId,
  assignment,
}: {
  assignmentId: string
  assignment: Assignment
}) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [students, setStudents] = useState<
    Array<{ id: string; full_name: string; rm: string; status: AttendanceStatus }>
  >([])
  const [isLoadingLessons, setIsLoadingLessons] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [lessonPlan, setLessonPlan] = useState<string | null>(null)
  const [showLessonPlan, setShowLessonPlan] = useState(false)
  const [newLesson, setNewLesson] = useState({
    date: formatDateForInput(),
    lesson_order: 1,
    content: '',
  })

  const classLabel = getClassLabel(assignment.classes)
  const subjectName = assignment.subjects.name

  const loadLessons = useCallback(async () => {
    try {
      setIsLoadingLessons(true)
      const data = await lessonsApi.getByAssignment(assignmentId)
      setLessons(data)
      setSelectedLessonId((current) => current ?? (data[0]?.id ?? null))
    } catch {
      toast.error('Erro ao carregar aulas.')
    } finally {
      setIsLoadingLessons(false)
    }
  }, [assignmentId])

  useEffect(() => {
    loadLessons()
  }, [loadLessons])

  useEffect(() => {
    if (!selectedLessonId) {
      setStudents([])
      return
    }

    const loadStudents = async () => {
      try {
        setIsLoadingStudents(true)
        const lesson = await lessonsApi.getById(selectedLessonId)
        const list = (lesson.students ?? []).map((s) => ({
          id: s.id,
          full_name: s.full_name,
          rm: s.rm,
          status: (s.attendance?.status ?? 'PRESENT') as AttendanceStatus,
        }))
        setStudents(list)
      } catch {
        toast.error('Erro ao carregar alunos da aula.')
      } finally {
        setIsLoadingStudents(false)
      }
    }
    loadStudents()
  }, [selectedLessonId])

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLesson.content.trim()) {
      toast.error('Informe o conteúdo da aula.')
      return
    }
    try {
      setIsCreating(true)
      const created = await lessonsApi.create({
        assignment_id: assignmentId,
        date: newLesson.date,
        lesson_order: newLesson.lesson_order,
        content: newLesson.content.trim(),
      })
      toast.success('Aula registrada com sucesso!')
      setShowCreateForm(false)
      setNewLesson({
        date: formatDateForInput(),
        lesson_order: lessons.length + 1,
        content: '',
      })
      await loadLessons()
      setSelectedLessonId(created.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar aula.'
      toast.error(message)
    } finally {
      setIsCreating(false)
    }
  }

  const toggleStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' }
          : s,
      ),
    )
  }

  const markAll = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })))
  }

  const handleSaveAttendance = async () => {
    if (!selectedLessonId || students.length === 0) return
    try {
      setIsSaving(true)
      await attendanceApi.markAttendance(selectedLessonId, {
        attendances: students.map((s) => ({
          student_id: s.id,
          status: s.status,
        })),
      })
      toast.success('Chamada salva com sucesso!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar chamada.'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateLessonPlan = async () => {
    const selectedLesson = lessons.find((l) => l.id === selectedLessonId)
    try {
      setIsGeneratingPlan(true)
      setShowLessonPlan(false)
      const result = await aiApi.generateLessonPlan({
        subject: subjectName,
        class_name: classLabel,
        topic: selectedLesson?.content ?? (newLesson.content || undefined),
      })
      setLessonPlan(result.content)
      setTimeout(() => setShowLessonPlan(true), 50)
      toast.success('Plano de aula gerado com sucesso!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar plano de aula.'
      toast.error(message)
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Diário de Classe</h2>
          <p className="text-sm text-text-secondary">
            Registre aulas e marque a presença dos alunos em lote.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateLessonPlan}
            disabled={isGeneratingPlan}
            className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
          >
            {isGeneratingPlan ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            Gerar Plano de Aula com IA
          </Button>
          <Button type="button" onClick={() => setShowCreateForm((v) => !v)}>
            <Plus size={16} />
            Nova Aula
          </Button>
        </div>
      </div>

      {(isGeneratingPlan || lessonPlan) && (
        <div
          className={cn(
            'overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm transition-all duration-500',
            showLessonPlan || isGeneratingPlan
              ? 'max-h-[2000px] opacity-100'
              : 'max-h-0 opacity-0',
          )}
        >
          <div className="border-b border-primary/10 px-5 py-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <h3 className="font-medium text-text-primary">
                Plano de Aula — Copiloto ClassOn
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-text-secondary">
              {subjectName} · {classLabel}
            </p>
          </div>
          <div className="p-5">
            {isGeneratingPlan ? (
              <div className="flex items-center gap-3 py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-text-secondary">
                  A IA está elaborando o plano pedagógico...
                </p>
              </div>
            ) : lessonPlan ? (
              <MarkdownContent content={lessonPlan} />
            ) : null}
          </div>
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleCreateLesson}
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <h3 className="mb-4 font-medium text-text-primary">Registrar Nova Aula</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="lesson-date">Data</Label>
              <Input
                id="lesson-date"
                type="date"
                value={newLesson.date}
                max={formatDateForInput()}
                onChange={(e) => setNewLesson((p) => ({ ...p, date: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lesson-order">Ordem da Aula</Label>
              <Input
                id="lesson-order"
                type="number"
                min={1}
                value={newLesson.lesson_order}
                onChange={(e) =>
                  setNewLesson((p) => ({
                    ...p,
                    lesson_order: parseInt(e.target.value, 10) || 1,
                  }))
                }
                required
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="lesson-content">Conteúdo</Label>
              <Input
                id="lesson-content"
                placeholder="Ex: Equações do 2º grau"
                value={newLesson.content}
                onChange={(e) => setNewLesson((p) => ({ ...p, content: e.target.value }))}
                required
                maxLength={500}
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Registrar
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card lg:col-span-1">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">Aulas Registradas</h3>
          </div>
          {isLoadingLessons ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : lessons.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-text-secondary">
              Nenhuma aula registrada. Crie a primeira aula acima.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={cn(
                      'w-full px-4 py-3 text-left transition-colors hover:bg-neutral-100',
                      selectedLessonId === lesson.id && 'bg-primary/5',
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                      <Calendar size={14} className="text-primary" />
                      {new Date(lesson.date).toLocaleDateString('pt-BR')}
                      <span className="text-text-secondary">· Aula {lesson.lesson_order}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-text-secondary">{lesson.content}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">Chamada</h3>
            {students.length > 0 && (
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => markAll('PRESENT')}>
                  <UserCheck size={14} />
                  Todos Presentes
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => markAll('ABSENT')}>
                  <UserX size={14} />
                  Todos Ausentes
                </Button>
              </div>
            )}
          </div>

          {isLoadingStudents ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !selectedLessonId ? (
            <p className="px-4 py-12 text-center text-sm text-text-secondary">
              Selecione ou crie uma aula para registrar a chamada.
            </p>
          ) : students.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-text-secondary">
              Nenhum aluno matriculado nesta turma.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {students.map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{student.full_name}</p>
                      <p className="text-xs text-text-secondary">RM {student.rm}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleStatus(student.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        student.status === 'PRESENT'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive',
                      )}
                    >
                      {student.status === 'PRESENT' ? (
                        <>
                          <UserCheck size={12} />
                          Presente
                        </>
                      ) : (
                        <>
                          <UserX size={12} />
                          Ausente
                        </>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border px-4 py-3">
                <Button type="button" onClick={handleSaveAttendance} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar Chamada
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function NotasTab({
  assignmentId,
  assignment,
}: {
  assignmentId: string
  assignment: Assignment
}) {
  const [bimesters, setBimesters] = useState<Bimester[]>([])
  const [selectedBimesterId, setSelectedBimesterId] = useState<string>('')
  const [rows, setRows] = useState<GradeFormRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingEnrollmentId, setSavingEnrollmentId] = useState<string | null>(null)

  useEffect(() => {
    const loadBimesters = async () => {
      try {
        const yearId = assignment.classes.academic_years.id
        const data = await bimestersApi.getByYear(yearId)
        setBimesters(data)
        if (data.length > 0) {
          setSelectedBimesterId(data[0].id)
        }
      } catch {
        toast.error('Erro ao carregar bimestres.')
      }
    }
    loadBimesters()
  }, [assignment.classes.academic_years.id])

  useEffect(() => {
    if (!selectedBimesterId) return

    const loadGrades = async () => {
      try {
        setIsLoading(true)
        const data = await gradesApi.getByAssignmentAndBimester(
          assignmentId,
          selectedBimesterId,
        )
        setRows(data.map(toGradeFormRow))
      } catch {
        toast.error('Erro ao carregar notas.')
      } finally {
        setIsLoading(false)
      }
    }
    loadGrades()
  }, [assignmentId, selectedBimesterId])

  const updateRow = (enrollmentId: string, field: keyof GradeFormRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.enrollmentId === enrollmentId ? { ...r, [field]: value } : r)),
    )
  }

  const getRowAverage = (row: GradeFormRow): number => {
    const n1 = parseGradeValue(row.n1)
    const n2 = parseGradeValue(row.n2)
    const n3 = parseGradeValue(row.n3)
    const n4 = parseGradeValue(row.n4)
    if (!row.n1 && !row.n2 && !row.n3 && !row.n4) return 0
    return calculateAverage(n1, n2, n3, n4)
  }

  const handleSaveRow = async (row: GradeFormRow) => {
    const n1 = parseGradeValue(row.n1)
    const n2 = parseGradeValue(row.n2)
    const n3 = parseGradeValue(row.n3)
    const n4 = parseGradeValue(row.n4)

    if ([n1, n2, n3, n4].some((n) => n < 0 || n > 10)) {
      toast.error('Notas devem estar entre 0 e 10.')
      return
    }

    try {
      setSavingEnrollmentId(row.enrollmentId)
      const saved = await gradesApi.create({
        enrollment_id: parseInt(row.enrollmentId, 10),
        assignment_id: parseInt(assignmentId, 10),
        bimester_id: parseInt(selectedBimesterId, 10),
        n1,
        n2,
        n3,
        n4,
      })

      if (getRowAverage(row) < 6 && row.recovery.trim() !== '') {
        const recovery = parseGradeValue(row.recovery)
        if (recovery >= 0 && recovery <= 10) {
          await gradesApi.addRecovery(saved.id, { recovery_grade: recovery })
        }
      }

      const refreshed = await gradesApi.getByAssignmentAndBimester(
        assignmentId,
        selectedBimesterId,
      )
      setRows(refreshed.map(toGradeFormRow))

      toast.success(`Notas de ${row.studentName} salvas!`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar notas.'
      toast.error(message)
    } finally {
      setSavingEnrollmentId(null)
    }
  }

  const selectedBimester = bimesters.find((b) => b.id === selectedBimesterId)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Lançamento de Notas</h2>
          <p className="text-sm text-text-secondary">
            Média mínima para aprovação: <strong>6,0</strong>
          </p>
        </div>
        <div>
          <Label htmlFor="bimester-select">Bimestre</Label>
          <select
            id="bimester-select"
            value={selectedBimesterId}
            onChange={(e) => setSelectedBimesterId(e.target.value)}
            className="mt-1 block rounded-lg border border-input bg-background px-3 py-2 text-sm text-text-primary focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20"
          >
            {bimesters.map((b) => (
              <option key={b.id} value={b.id}>
                {b.number}º Bimestre {b.status === 'FECHADO' ? '(Fechado)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedBimester?.status === 'FECHADO' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Este bimestre está fechado. Alterações podem não ser permitidas.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-secondary">
          Nenhum aluno matriculado nesta turma.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                <th className="px-4 py-3">Aluno</th>
                <th className="px-3 py-3 text-center">N1</th>
                <th className="px-3 py-3 text-center">N2</th>
                <th className="px-3 py-3 text-center">N3</th>
                <th className="px-3 py-3 text-center">N4</th>
                <th className="px-3 py-3 text-center">Média</th>
                <th className="px-3 py-3 text-center">Recuperação</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const average = getRowAverage(row)
                const isApproved = average >= 6
                const isSaving = savingEnrollmentId === row.enrollmentId

                return (
                  <tr key={row.enrollmentId} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{row.studentName}</p>
                      <p className="text-xs text-text-secondary">RM {row.studentRm}</p>
                    </td>
                    {(['n1', 'n2', 'n3', 'n4'] as const).map((field) => (
                      <td key={field} className="px-2 py-2 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          step={0.1}
                          value={row[field]}
                          onChange={(e) => updateRow(row.enrollmentId, field, e.target.value)}
                          className="mx-auto w-16 text-center"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center">
                      <span
                        className={cn(
                          'font-semibold',
                          average >= 6
                            ? 'text-success'
                            : average > 0
                              ? 'text-destructive'
                              : 'text-text-secondary',
                        )}
                      >
                        {average > 0 ? average.toFixed(1) : '—'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      {average > 0 && average < 6 ? (
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          step={0.1}
                          placeholder="Rec."
                          value={row.recovery}
                          onChange={(e) => updateRow(row.enrollmentId, 'recovery', e.target.value)}
                          className="mx-auto w-16 text-center"
                        />
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {average > 0 && (
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                            isApproved
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive',
                          )}
                        >
                          {isApproved ? 'Aprovado' : 'Em Recuperação'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => handleSaveRow(row)}
                      >
                        {isSaving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        Salvar
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function TarefasTab({
  assignmentId,
  assignment,
}: {
  assignmentId: string
  assignment: Assignment
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
  })

  const classLabel = getClassLabel(assignment.classes)

  const handleAiInsert = ({
    title,
    content,
  }: {
    title: string
    content: string
  }) => {
    setForm((prev) => ({
      ...prev,
      title: prev.title.trim() ? prev.title : title,
      description: content,
    }))
    toast.success('Tarefa da IA inserida no formulário. Revise e publique!')
  }

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      const all = await tasksApi.list()
      setTasks(all.filter((t) => t.assignment_id === assignmentId))
    } catch {
      toast.error('Erro ao carregar tarefas.')
    } finally {
      setIsLoading(false)
    }
  }, [assignmentId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.title.length < 5 || form.description.length < 10) {
      toast.error('Preencha título (mín. 5) e descrição (mín. 10 caracteres).')
      return
    }
    if (!form.deadline) {
      toast.error('Informe a data de entrega.')
      return
    }

    try {
      setIsCreating(true)
      await tasksApi.create({
        assignment_id: assignmentId,
        title: form.title.trim(),
        description: form.description.trim(),
        deadline: new Date(form.deadline).toISOString(),
      })
      toast.success('Tarefa criada com sucesso!')
      setForm({ title: '', description: '', deadline: '' })
      await loadTasks()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar tarefa.'
      toast.error(message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Tarefas</h2>
        <p className="text-sm text-text-secondary">
          Crie atividades vinculadas a esta turma e disciplina.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-medium text-text-primary">Nova Tarefa</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAiModal(true)}
            className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
          >
            <Sparkles size={16} />
            Gerar tarefa com IA
          </Button>
        </div>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              placeholder="Ex: Lista de exercícios — Cap. 5"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              minLength={5}
              maxLength={255}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="task-description">Descrição</Label>
            <Textarea
              id="task-description"
              placeholder="Descreva a atividade e instruções para os alunos..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
              minLength={10}
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="max-w-xs">
            <Label htmlFor="task-deadline">Data de Entrega</Label>
            <Input
              id="task-deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
        </div>
        <Button type="submit" className="mt-4" disabled={isCreating}>
          {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Criar Tarefa
        </Button>
      </form>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-text-primary">Tarefas Criadas</h3>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-text-secondary">
            Nenhuma tarefa criada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => setSelectedTaskId(task.id)}
                  className="flex w-full flex-wrap items-start justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-neutral-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary">{task.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right text-xs text-text-secondary">
                      <p>
                        Entrega:{' '}
                        {new Date(task.deadline).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                      <span
                        className={cn(
                          'mt-1 inline-flex rounded-full px-2 py-0.5 font-medium',
                          task.status === 'OPEN'
                            ? 'bg-success/10 text-success'
                            : 'bg-neutral-200 text-neutral-600',
                        )}
                      >
                        {task.status === 'OPEN' ? 'Aberta' : 'Fechada'}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-text-secondary" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <TaskDetailDialog
        taskId={selectedTaskId}
        open={selectedTaskId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null)
        }}
        onUpdated={loadTasks}
        onDeleted={loadTasks}
      />

      <AiTaskGeneratorModal
        open={showAiModal}
        onOpenChange={setShowAiModal}
        defaultClassLabel={classLabel}
        defaultTitle={form.title}
        onInsert={handleAiInsert}
      />
    </div>
  )
}

function AlunosTab({
  assignmentId,
  assignment,
}: {
  assignmentId: string
  assignment: Assignment
}) {
  const [rows, setRows] = useState<GradeFormRow[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const yearId = assignment.classes.academic_years.id
        const bimesters = await bimestersApi.getByYear(yearId)
        const openBimester = bimesters.find((b) => b.status === 'ABERTO') ?? bimesters[0]
        if (!openBimester) {
          setRows([])
          return
        }

        const gradeRows = await gradesApi.getByAssignmentAndBimester(
          assignmentId,
          openBimester.id,
        )
        setRows(gradeRows.map(toGradeFormRow))
      } catch {
        toast.error('Erro ao carregar alunos da turma.')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [assignmentId, assignment.classes.academic_years.id])

  const sortedRows = [...rows].sort((a, b) =>
    a.studentName.localeCompare(b.studentName, 'pt-BR'),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Alunos da Turma</h2>
        <p className="text-sm text-text-secondary">
          {assignment.subjects.name} · {getClassLabel(assignment.classes)}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sortedRows.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-secondary">
          Nenhum aluno matriculado nesta turma.
        </p>
      ) : (
        <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
          <ul className="divide-y divide-border">
            {sortedRows.map((row) => (
              <li
                key={row.enrollmentId}
                className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <GraduationCap size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-text-primary">{row.studentName}</p>
                    <p className="text-sm text-text-secondary">RM: {row.studentRm}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudentId(row.studentId)}
                >
                  Ver desempenho
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ProfessorStudentDetailDialog
        open={selectedStudentId != null}
        onOpenChange={(open) => {
          if (!open) setSelectedStudentId(null)
        }}
        studentId={selectedStudentId}
        assignmentId={assignmentId}
        classId={assignment.class_id}
        subjectName={assignment.subjects.name}
      />
    </div>
  )
}
