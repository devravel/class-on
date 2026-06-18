'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateEventDto, eventsApi } from '@/lib/api/events'
import { Class, classesApi } from '@/lib/api/classes'
import { getClassLabel } from '@/lib/class-utils'
import { useAuth } from '@/contexts/auth-context'
import { toastEventCreateError, toastEventCreated } from '@/lib/events/feedback'
import { toast } from 'sonner'

const eventSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Título deve ter no mínimo 5 caracteres')
      .max(255, 'Título deve ter no máximo 255 caracteres'),
    description: z
      .string()
      .min(10, 'Descrição deve ter no mínimo 10 caracteres')
      .max(5000, 'Descrição deve ter no máximo 5000 caracteres'),
    start_date: z.string().min(1, 'Data de início é obrigatória'),
    end_date: z.string().min(1, 'Data de fim é obrigatória'),
    all_day: z.boolean(),
    scope_type: z.enum(['ALL_SCHOOL', 'TEACHERS', 'STUDENTS', 'SPECIFIC_CLASSES']),
    class_ids: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.all_day) {
      const s = data.start_date.slice(0, 10)
      const e = data.end_date.slice(0, 10)
      if (s > e) {
        ctx.addIssue({
          code: 'custom',
          path: ['end_date'],
          message: 'A data de término deve ser a mesma que a de início ou posterior.',
        })
      }
    } else {
      const a = new Date(data.start_date)
      const b = new Date(data.end_date)
      if (a > b) {
        ctx.addIssue({
          code: 'custom',
          path: ['end_date'],
          message: 'A data e hora de término devem ser iguais ou posteriores às de início.',
        })
      }
    }
  })

type EventFormData = z.infer<typeof eventSchema>

interface EventFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialDate?: Date
}

export function EventForm({ onSuccess, onCancel, initialDate }: EventFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      all_day: false,
      scope_type: 'ALL_SCHOOL',
      start_date: initialDate ? formatDatetimeLocal(initialDate) : '',
      end_date: initialDate ? formatDatetimeLocal(initialDate) : '',
    },
  })

  const scopeType = watch('scope_type')
  const allDay = watch('all_day')

  const loadClasses = async () => {
    try {
      setLoadingClasses(true)
      const data = await classesApi.getAll()
      setClasses(data)
    } catch (err) {
      console.error('Erro ao carregar turmas:', err)
      toast.error('Não foi possível carregar as turmas', {
        description: 'Atualize a página ou tente novamente em instantes.',
      })
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleScopeTypeChange = (value: string) => {
    setValue('scope_type', value as EventFormData['scope_type'])
    if (value === 'SPECIFIC_CLASSES' && classes.length === 0) {
      loadClasses()
    }
    setValue('class_ids', [])
  }

  const buildCreatePayload = (data: EventFormData): CreateEventDto => {
    if (data.all_day) {
      const startYmd = data.start_date.slice(0, 10)
      const endYmd = data.end_date.slice(0, 10)
      return {
        title: data.title,
        description: data.description,
        start_date: startYmd,
        end_date: endYmd,
        all_day: true,
        scope_type: data.scope_type,
        ...(data.scope_type === 'SPECIFIC_CLASSES' && { class_ids: data.class_ids }),
      }
    }
    return {
      title: data.title,
      description: data.description,
      start_date: normalizeDatetimeLocalForApi(data.start_date),
      end_date: normalizeDatetimeLocalForApi(data.end_date),
      all_day: false,
      scope_type: data.scope_type,
      ...(data.scope_type === 'SPECIFIC_CLASSES' && { class_ids: data.class_ids }),
    }
  }

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true)

      if (data.scope_type === 'SPECIFIC_CLASSES' && (!data.class_ids || data.class_ids.length === 0)) {
        toast.error('Selecione as turmas', {
          description: 'Para eventos em turmas específicas, escolha ao menos uma turma.',
        })
        return
      }

      const createData = buildCreatePayload(data)
      await eventsApi.create(createData)
      toastEventCreated()
      onSuccess?.()
    } catch (err) {
      console.error('Erro ao criar evento:', err)
      toastEventCreateError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScopeOptions = () => {
    if (user?.role === 'PROFESSOR') {
      return [
        { value: 'STUDENTS', label: 'Para Alunos' },
        { value: 'SPECIFIC_CLASSES', label: 'Turmas Específicas' },
      ]
    }

    return [
      { value: 'ALL_SCHOOL', label: 'Toda Escola' },
      { value: 'TEACHERS', label: 'Apenas Professores' },
      { value: 'STUDENTS', label: 'Apenas Alunos' },
      { value: 'SPECIFIC_CLASSES', label: 'Turmas Específicas' },
    ]
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Novo Evento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register('title')} placeholder="Digite o título do evento" />
            {errors.title && (
              <p className="text-sm text-danger mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Descreva o evento"
              className="min-h-20 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-danger mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">{allDay ? 'Data de início' : 'Data e hora de início'}</Label>
              <Input
                id="start_date"
                type={allDay ? 'date' : 'datetime-local'}
                step={allDay ? undefined : 60}
                disabled={isSubmitting}
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-sm text-danger mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">{allDay ? 'Data de término' : 'Data e hora de término'}</Label>
              <Input
                id="end_date"
                type={allDay ? 'date' : 'datetime-local'}
                step={allDay ? undefined : 60}
                disabled={isSubmitting}
                {...register('end_date')}
              />
              {errors.end_date && (
                <p className="text-sm text-danger mt-1">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="all_day"
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              checked={!!allDay}
              disabled={isSubmitting}
              onChange={(e) => {
                const checked = e.target.checked
                const curStart = getValues('start_date')
                const curEnd = getValues('end_date')
                if (checked) {
                  const s = toYmdFromField(curStart)
                  const e = toYmdFromField(curEnd || curStart)
                  setValue('start_date', s)
                  setValue('end_date', e < s ? s : e)
                } else {
                  const s = toYmdFromField(curStart)
                  const e = toYmdFromField(curEnd || curStart)
                  const endY = e < s ? s : e
                  setValue('start_date', `${s}T09:00`)
                  setValue('end_date', `${endY}T10:00`)
                }
                setValue('all_day', checked, { shouldValidate: true, shouldDirty: true })
              }}
            />
            <Label htmlFor="all_day" className="text-sm">
              Evento de dia inteiro
            </Label>
          </div>
          {allDay && (
            <p className="text-xs text-text-secondary -mt-2">
              Horários são ignorados: o evento ocupa o(s) dia(s) civil(is) selecionado(s).
            </p>
          )}

          <div>
            <Label>Escopo do Evento</Label>
            <Select value={scopeType} onValueChange={handleScopeTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o escopo" />
              </SelectTrigger>
              <SelectContent>
                {getScopeOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {scopeType === 'SPECIFIC_CLASSES' && (
            <div>
              <Label>Turmas</Label>
              {loadingClasses ? (
                <div className="text-sm text-text-secondary">Carregando turmas...</div>
              ) : (
                <Select
                  onValueChange={(value) => {
                    const currentIds = watch('class_ids') || []
                    if (!currentIds.includes(value)) {
                      setValue('class_ids', [...currentIds, value])
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione as turmas" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {getClassLabel(cls)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {(watch('class_ids')?.length ?? 0) > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {watch('class_ids')?.map((classId) => {
                    const cls = classes.find((c) => c.id === classId)
                    return (
                      <span
                        key={classId}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-1 text-xs"
                      >
                        {cls ? getClassLabel(cls) : classId}
                        <button
                          type="button"
                          onClick={() => {
                            const currentIds = watch('class_ids') || []
                            setValue(
                              'class_ids',
                              currentIds.filter((id) => id !== classId),
                            )
                          }}
                          className="hover:text-danger"
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function formatDatetimeLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

function toYmdFromField(val: string): string {
  if (!val) {
    const n = new Date()
    const y = n.getFullYear()
    const m = String(n.getMonth() + 1).padStart(2, '0')
    const d = String(n.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (val.length >= 10 && val[4] === '-' && val[7] === '-') {
    return val.slice(0, 10)
  }
  return toYmdFromField('')
}

/** datetime-local sem segundos → ISO aceito pelo backend */
function normalizeDatetimeLocalForApi(value: string): string {
  if (value.length === 16) {
    return `${value}:00`
  }
  return value
}
