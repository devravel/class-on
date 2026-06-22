'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CreateAnnouncementDto } from '@/types/announcement'
import { assignmentsApi, authApi } from '@/lib/api'
import { classesApi } from '@/lib/api/classes'
import { studentsApi } from '@/lib/api/students'
import { useAuth } from '@/contexts/auth-context'
import { getClassLabel } from '@/lib/class-utils'

const announcementFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Título deve ter no mínimo 5 caracteres.')
    .max(255, 'Título deve ter no máximo 255 caracteres.'),
  message: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres.')
    .max(5000, 'Mensagem deve ter no máximo 5000 caracteres.'),
  scope_type: z.enum(['ALL_SCHOOL', 'TEACHERS', 'STUDENTS']),
  target_type: z.enum(['ALL', 'CLASS', 'STUDENT']),
  class_ids: z.array(z.string()).optional(),
  student_ids: z.array(z.string()).optional(),
})

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>

interface AnnouncementFormProps {
  defaultValues?: CreateAnnouncementDto
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: CreateAnnouncementDto) => void
  onCancel: () => void
  submitLabel?: string
}

export function AnnouncementForm({
  defaultValues,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
  submitLabel = 'Enviar Comunicado',
}: AnnouncementFormProps) {
  const { user } = useAuth()
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: defaultValues || {
      title: '',
      message: '',
      scope_type: 'ALL_SCHOOL',
      target_type: 'ALL',
      class_ids: [],
      student_ids: [],
    },
  })

  const watchScopeType = form.watch('scope_type')
  const watchTargetType = form.watch('target_type')

  // Carregar turmas quando necessário
  useEffect(() => {
    if (watchTargetType !== 'CLASS') return

    setLoadingClasses(true)

    const loadClasses = async () => {
      try {
        if (user?.role === 'PROFESSOR') {
          const me = await authApi.getMe()
          if (!me.teacher) {
            setClasses([])
            return
          }

          const assignments = await assignmentsApi.getByTeacher(me.teacher.id)
          const uniqueClasses = new Map<string, { id: string; name: string; shift: string }>()

          for (const assignment of assignments) {
            if (!assignment.classes || uniqueClasses.has(assignment.classes.id)) continue
            uniqueClasses.set(assignment.classes.id, {
              id: assignment.classes.id,
              name: getClassLabel(assignment.classes),
              shift: assignment.classes.shift,
            })
          }

          setClasses(Array.from(uniqueClasses.values()))
          return
        }

        const data = await classesApi.list()
        setClasses(
          data.map((cls) => ({
            id: cls.id,
            name: getClassLabel(cls),
            shift: cls.shift,
          })),
        )
      } catch (err) {
        console.error(err)
        setClasses([])
      } finally {
        setLoadingClasses(false)
      }
    }

    void loadClasses()
  }, [watchTargetType, user?.role])

  // Carregar alunos quando necessário
  useEffect(() => {
    if (watchTargetType === 'STUDENT') {
      setLoadingStudents(true)
      studentsApi
        .list()
        .then(setStudents)
        .catch(console.error)
        .finally(() => setLoadingStudents(false))
    }
  }, [watchTargetType])

  // Validar permissões do professor
  const getScopeOptions = () => {
    if (user?.role === 'PROFESSOR') {
      return [{ value: 'STUDENTS', label: 'Apenas Alunos' }]
    }
    return [
      { value: 'ALL_SCHOOL', label: 'Toda a Escola' },
      { value: 'TEACHERS', label: 'Apenas Professores' },
      { value: 'STUDENTS', label: 'Apenas Alunos' },
    ]
  }

  const getTargetOptions = () => {
    const options = [{ value: 'ALL', label: 'Todos' }]
    
    if (watchScopeType === 'STUDENTS') {
      options.push(
        { value: 'CLASS', label: 'Turmas Específicas' },
        { value: 'STUDENT', label: 'Alunos Específicos' }
      )
    }
    
    return options
  }

  const handleSubmit = (values: AnnouncementFormValues) => {
    const dto: CreateAnnouncementDto = {
      title: values.title,
      message: values.message,
      scope_type: values.scope_type,
      target_type: values.target_type,
    }

    if (values.target_type === 'CLASS' && values.class_ids?.length) {
      dto.class_ids = values.class_ids
    }

    if (values.target_type === 'STUDENT' && values.student_ids?.length) {
      dto.student_ids = values.student_ids
    }

    onSubmit(dto)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Reunião pedagógica - 15/01"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite a mensagem do comunicado..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scope_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escopo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o escopo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getScopeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="target_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destinatários</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione os destinatários" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getTargetOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchTargetType === 'CLASS' && (
          <FormField
            control={form.control}
            name="class_ids"
            render={() => (
              <FormItem>
                <FormLabel>Selecionar Turmas</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {loadingClasses ? (
                    <p className="text-sm text-neutral-500">Carregando turmas...</p>
                  ) : (
                    classes.map((cls) => (
                      <FormField
                        key={cls.id}
                        control={form.control}
                        name="class_ids"
                        render={({ field }) => (
                          <FormItem
                            key={cls.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(cls.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), cls.id])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== cls.id)
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {cls.name} - {cls.shift}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchTargetType === 'STUDENT' && (
          <FormField
            control={form.control}
            name="student_ids"
            render={() => (
              <FormItem>
                <FormLabel>Selecionar Alunos</FormLabel>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {loadingStudents ? (
                    <p className="text-sm text-neutral-500">Carregando alunos...</p>
                  ) : (
                    students.map((student) => (
                      <FormField
                        key={student.id}
                        control={form.control}
                        name="student_ids"
                        render={({ field }) => (
                          <FormItem
                            key={student.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(student.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), student.id])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== student.id)
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {student.full_name} - RM: {student.rm}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X size={16} className="mr-1" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Send size={16} className="mr-1" />
            {isSubmitting ? 'Enviando...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}