'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { teachersApi, classesApi, subjectsApi } from '@/lib/api'
import { getClassLabel } from '@/lib/class-utils'
import { Teacher } from '@/types/teacher'
import { Class } from '@/types/class'
import { Subject } from '@/types/subject'

const assignmentFormSchema = z.object({
  teacher_id: z.string().min(1, 'Selecione um professor'),
  class_id: z.string().min(1, 'Selecione uma turma'),
  subject_id: z.string().min(1, 'Selecione uma disciplina'),
})

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

interface AssignmentFormProps {
  defaultValues?: AssignmentFormValues
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: AssignmentFormValues) => void
  onCancel: () => void
  submitLabel?: string
}

export function AssignmentForm({
  defaultValues,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
}: AssignmentFormProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: defaultValues ?? {
      teacher_id: '',
      class_id: '',
      subject_id: '',
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        const [teachersData, classesData, subjectsData] = await Promise.all([
          teachersApi.list(),
          classesApi.list(),
          subjectsApi.list(),
        ])
        setTeachers(teachersData.filter((t) => t.users.is_active))
        setClasses(classesData)
        setSubjects(subjectsData)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  const getClassOptionLabel = (classItem: Class) => {
    return `${getClassLabel(classItem)} (${classItem.academic_years.year})`
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-component border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="teacher_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professor *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um professor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name} ({teacher.registration_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disciplina *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="class_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turma *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {getClassOptionLabel(classItem)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save size={16} />
            {isSubmitting ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
