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
import { ApiError } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'

const eventSchema = z.object({
  title: z.string()
    .min(5, 'Título deve ter no mínimo 5 caracteres')
    .max(255, 'Título deve ter no máximo 255 caracteres'),
  description: z.string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(5000, 'Descrição deve ter no máximo 5000 caracteres'),
  start_date: z.string()
    .min(1, 'Data de início é obrigatória'),
  end_date: z.string()
    .min(1, 'Data de fim é obrigatória'),
  all_day: z.boolean(),
  scope_type: z.enum(['ALL_SCHOOL', 'TEACHERS', 'STUDENTS', 'SPECIFIC_CLASSES']),
  class_ids: z.array(z.string()).optional(),
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
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      all_day: false,
      scope_type: 'ALL_SCHOOL',
      start_date: initialDate ? formatDateForInput(initialDate) : '',
      end_date: initialDate ? formatDateForInput(initialDate) : '',
    },
  })

  const scopeType = watch('scope_type')

  const loadClasses = async () => {
    try {
      setLoadingClasses(true)
      const data = await classesApi.getAll()
      setClasses(data)
    } catch (err) {
      console.error('Erro ao carregar turmas:', err)
    } finally {
      setLoadingClasses(false)
    }
  }

  // Carregar turmas quando scope_type for SPECIFIC_CLASSES
  const handleScopeTypeChange = (value: string) => {
    setValue('scope_type', value as any)
    if (value === 'SPECIFIC_CLASSES' && classes.length === 0) {
      loadClasses()
    }
    // Limpar class_ids quando mudar scope
    setValue('class_ids', [])
  }

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true)

      // Validar se start_date <= end_date
      if (new Date(data.start_date) > new Date(data.end_date)) {
        throw new Error('Data de início deve ser anterior ou igual à data de fim')
      }

      // Validar class_ids para SPECIFIC_CLASSES
      if (data.scope_type === 'SPECIFIC_CLASSES' && (!data.class_ids || data.class_ids.length === 0)) {
        throw new Error('Selecione pelo menos uma turma')
      }

      const createData: CreateEventDto = {
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        all_day: data.all_day,
        scope_type: data.scope_type,
        ...(data.scope_type === 'SPECIFIC_CLASSES' && { class_ids: data.class_ids }),
      }

      await eventsApi.create(createData)
      onSuccess?.()
    } catch (err) {
      console.error('Erro ao criar evento:', err)
      let message = 'Erro ao criar evento'
      
      if (err instanceof ApiError) {
        message = err.message
      } else if (err instanceof Error) {
        message = err.message
      }
      
      alert(message) // TODO: Replace with proper toast notification
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
            <Input
              id="title"
              {...register('title')}
              placeholder="Digite o título do evento"
            />
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
              <Label htmlFor="start_date">Data/Hora de Início</Label>
              <Input
                id="start_date"
                type="datetime-local"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-sm text-danger mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">Data/Hora de Fim</Label>
              <Input
                id="end_date"
                type="datetime-local"
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
              {...register('all_day')}
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="all_day" className="text-sm">
              Evento de dia inteiro
            </Label>
          </div>

          <div>
            <Label>Escopo do Evento</Label>
            <Select 
              value={scopeType} 
              onValueChange={handleScopeTypeChange}
            >
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
                        {cls.series}º {cls.letter} - {cls.shift}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {/* Mostrar turmas selecionadas */}
              {(watch('class_ids')?.length ?? 0) > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {watch('class_ids')?.map((classId) => {
                    const cls = classes.find(c => c.id === classId)
                    return (
                      <span 
                        key={classId}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-1 text-xs"
                      >
                        {cls ? `${cls.series}º ${cls.letter} - ${cls.shift}` : classId}
                        <button
                          type="button"
                          onClick={() => {
                            const currentIds = watch('class_ids') || []
                            setValue('class_ids', currentIds.filter(id => id !== classId))
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

function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 16)
}