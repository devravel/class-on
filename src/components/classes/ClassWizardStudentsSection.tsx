'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { WizardManualStudent } from '@/types/class'

const manualStudentSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres.')
    .max(255, 'Nome deve ter no máximo 255 caracteres.'),
  email: z
    .string()
    .email('Informe um endereço de e-mail válido.')
    .max(255, 'E-mail deve ter no máximo 255 caracteres.'),
  rm: z
    .string()
    .min(2, 'RM deve ter no mínimo 2 caracteres.')
    .max(255, 'RM deve ter no máximo 255 caracteres.'),
})

type ManualStudentFormValues = z.infer<typeof manualStudentSchema>

interface ClassWizardStudentsSectionProps {
  studentMode: 'manual' | 'bulk' | null
  onStudentModeChange: (mode: 'manual' | 'bulk' | null) => void
  manualStudents: WizardManualStudent[]
  onManualStudentsChange: (students: WizardManualStudent[]) => void
  bulkCount: number
  onBulkCountChange: (count: number) => void
}

export function ClassWizardStudentsSection({
  studentMode,
  onStudentModeChange,
  manualStudents,
  onManualStudentsChange,
  bulkCount,
  onBulkCountChange,
}: ClassWizardStudentsSectionProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ManualStudentFormValues>({
    resolver: zodResolver(manualStudentSchema),
    defaultValues: {
      full_name: '',
      email: '',
      rm: '',
    },
  })

  useEffect(() => {
    if (studentMode !== 'manual') {
      setFormError(null)
    }
  }, [studentMode])

  const handleAddManualStudent = (values: ManualStudentFormValues) => {
    const email = values.email.toLowerCase()
    const rm = values.rm.toUpperCase()

    const duplicateEmail = manualStudents.some(
      (student) => student.email.toLowerCase() === email,
    )
    const duplicateRm = manualStudents.some(
      (student) => student.rm.toUpperCase() === rm,
    )

    if (duplicateEmail || duplicateRm) {
      setFormError('E-mail ou RM já adicionado nesta turma.')
      return
    }

    setFormError(null)
    onManualStudentsChange([
      ...manualStudents,
      {
        full_name: values.full_name.trim(),
        email,
        rm,
      },
    ])
    form.reset()
  }

  const handleRemoveManualStudent = (index: number) => {
    onManualStudentsChange(manualStudents.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users size={18} className="text-text-secondary" />
        <h3 className="text-base font-semibold text-text-primary">Alunos</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={studentMode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStudentModeChange('manual')}
        >
          Cadastro Manual
        </Button>
        <Button
          type="button"
          variant={studentMode === 'bulk' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStudentModeChange('bulk')}
        >
          Cadastro em Lote
        </Button>
        {studentMode && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onStudentModeChange(null)}
          >
            Pular alunos
          </Button>
        )}
      </div>

      {studentMode === 'manual' && (
        <div className="space-y-4 rounded-component border border-border p-4">
          <p className="text-sm text-text-secondary">
            Adicione alunos que serão matriculados automaticamente nesta turma.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddManualStudent)}
              className="space-y-4"
            >
              {formError && (
                <div className="rounded-component border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Maria da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Ex: maria.silva@escola.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RM *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 20260001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" variant="outline" size="sm">
                <Plus size={14} />
                Adicionar aluno
              </Button>
            </form>
          </Form>

          {manualStudents.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                Alunos adicionados ({manualStudents.length})
              </p>
              <ul className="divide-y divide-border rounded-component border border-border">
                {manualStudents.map((student, index) => (
                  <li
                    key={`${student.rm}-${index}`}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {student.full_name}
                      </p>
                      <p className="text-text-secondary">
                        {student.email} · RM {student.rm}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveManualStudent(index)}
                      aria-label={`Remover ${student.full_name}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {studentMode === 'bulk' && (
        <div className="space-y-3 rounded-component border border-border p-4">
          <p className="text-sm text-text-secondary">
            Os alunos serão gerados automaticamente com nomes brasileiros, RM
            sequencial e e-mail no formato [RM]@classon.com.
          </p>

          <div className="max-w-xs space-y-2">
            <label
              htmlFor="bulk-count"
              className="text-sm font-medium text-text-primary"
            >
              Quantidade de alunos
            </label>
            <Input
              id="bulk-count"
              type="number"
              min={1}
              max={200}
              value={bulkCount || ''}
              onChange={(event) => {
                const value = Number(event.target.value)
                onBulkCountChange(Number.isNaN(value) ? 0 : value)
              }}
              placeholder="Ex: 30"
            />
            <p className="text-xs text-text-secondary">Mínimo 1, máximo 200.</p>
            {bulkCount > 30 && (
              <p className="text-xs text-amber-700">
                Lotes com mais de 30 alunos podem levar alguns segundos para
                serem processados. Aguarde até a conclusão.
              </p>
            )}
          </div>
        </div>
      )}

      {!studentMode && (
        <p className="text-sm text-text-secondary">
          Opcional: você pode cadastrar alunos agora ou adicioná-los depois.
        </p>
      )}
    </div>
  )
}
