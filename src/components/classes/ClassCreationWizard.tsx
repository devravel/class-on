'use client'

import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react'

import { ClassForm, ClassFormValues } from '@/components/classes/ClassForm'
import { ClassWizardStudentsSection } from '@/components/classes/ClassWizardStudentsSection'
import { ClassWizardTeachersSection } from '@/components/classes/ClassWizardTeachersSection'
import { Button } from '@/components/ui/button'
import { classesApi } from '@/lib/api'
import {
  ClassWizardResponse,
  WizardManualStudent,
  formatClassShortLabel,
  EDUCATION_LEVEL_LABELS,
  SHIFT_LABELS,
  Shift,
} from '@/types/class'

interface ClassCreationWizardProps {
  onCancel: () => void
  onSuccess: (result: ClassWizardResponse) => void
}

export function ClassCreationWizard({
  onCancel,
  onSuccess,
}: ClassCreationWizardProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [classData, setClassData] = useState<ClassFormValues | null>(null)
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([])
  const [studentMode, setStudentMode] = useState<'manual' | 'bulk' | null>(null)
  const [manualStudents, setManualStudents] = useState<WizardManualStudent[]>([])
  const [bulkCount, setBulkCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStep1Submit = (values: ClassFormValues) => {
    setClassData(values)
    setError(null)
    setStep(2)
  }

  const handleCreateClass = async () => {
    if (!classData) {
      return
    }

    if (studentMode === 'manual' && manualStudents.length === 0) {
      setError('Adicione ao menos um aluno no cadastro manual ou escolha outra opção.')
      return
    }

    if (studentMode === 'bulk' && bulkCount < 1) {
      setError('Informe a quantidade de alunos para o cadastro em lote.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const payload = {
        year_id: Number(classData.year_id),
        education_level: classData.education_level,
        series: Number(classData.series),
        letter: classData.letter,
        shift: classData.shift,
        ...(selectedTeacherIds.length > 0 && {
          teacher_ids: selectedTeacherIds.map((id) => Number(id)),
        }),
        ...(studentMode === 'manual' && { manual_students: manualStudents }),
        ...(studentMode === 'bulk' && { bulk_student_count: bulkCount }),
      }

      const result = await classesApi.createWizard(payload)
      onSuccess(result)
    } catch (err: unknown) {
      console.error('Erro ao criar turma:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(message || 'Não foi possível criar a turma. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
            step === 1
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {step > 1 ? <CheckCircle2 size={16} /> : '1'}
        </div>
        <div className="h-px flex-1 bg-border" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
            step === 2
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-text-secondary'
          }`}
        >
          2
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div
          className={`rounded-component border p-3 ${
            step === 1 ? 'border-primary/30 bg-primary/5' : 'border-border'
          }`}
        >
          <p className="text-sm font-medium text-text-primary">Passo 1</p>
          <p className="text-xs text-text-secondary">Dados da turma</p>
        </div>
        <div
          className={`rounded-component border p-3 ${
            step === 2 ? 'border-primary/30 bg-primary/5' : 'border-border'
          }`}
        >
          <p className="text-sm font-medium text-text-primary">Passo 2</p>
          <p className="text-xs text-text-secondary">Professores e alunos</p>
        </div>
      </div>

      {step === 1 && (
        <ClassForm
          defaultValues={classData ?? undefined}
          isSubmitting={false}
          error={error}
          onSubmit={handleStep1Submit}
          onCancel={onCancel}
          submitLabel="Continuar"
        />
      )}

      {step === 2 && classData && (
        <div className="space-y-6">
          <div className="rounded-component border border-border bg-muted/30 p-4 text-sm">
            <p className="font-medium text-text-primary">Resumo da turma</p>
            <p className="mt-1 text-text-secondary">
              {formatClassShortLabel({
                series: Number(classData.series),
                letter: classData.letter,
                education_level: classData.education_level,
              })}{' '}
              · {EDUCATION_LEVEL_LABELS[classData.education_level]} ·{' '}
              {SHIFT_LABELS[classData.shift as Shift]}
            </p>
          </div>

          {error && (
            <div className="rounded-component border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <ClassWizardTeachersSection
            selectedTeacherIds={selectedTeacherIds}
            onSelectedTeacherIdsChange={setSelectedTeacherIds}
          />

          <ClassWizardStudentsSection
            studentMode={studentMode}
            onStudentModeChange={setStudentMode}
            manualStudents={manualStudents}
            onManualStudentsChange={setManualStudents}
            bulkCount={bulkCount}
            onBulkCountChange={setBulkCount}
          />

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError(null)
                setStep(1)
              }}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCreateClass}
                disabled={isSubmitting}
              >
                <Save size={16} />
                {isSubmitting ? 'Criando turma...' : 'Criar Turma'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
