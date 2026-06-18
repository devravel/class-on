'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'

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
import { academicYearsApi } from '@/lib/api'
import { AcademicYear } from '@/types/academic-year'
import {
  EDUCATION_LEVEL_LABELS,
  EDUCATION_LEVEL_OPTIONS,
  EducationLevel,
  formatSeriesLabel,
  getSeriesOptionsForLevel,
  isValidSeriesForLevel,
  LETTER_OPTIONS,
  SHIFT_LABELS,
  SHIFT_OPTIONS,
} from '@/types/class'

const classFormSchema = z
  .object({
    year_id: z.string().min(1, 'Selecione um ano letivo'),
    education_level: z.enum(['FUNDAMENTAL', 'MEDIO'], {
      message: 'Selecione o nível de ensino',
    }),
    series: z.string().min(1, 'Selecione a série'),
    letter: z.string().min(1, 'Selecione a letra'),
    shift: z.string().min(1, 'Selecione o turno'),
  })
  .superRefine((values, ctx) => {
    const series = Number(values.series)
    if (!/^\d+$/.test(values.series) || !Number.isInteger(series)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione uma série válida',
        path: ['series'],
      })
      return
    }

    if (!isValidSeriesForLevel(series, values.education_level)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          values.education_level === 'MEDIO'
            ? 'Para Ensino Médio, a série deve ser 1, 2 ou 3'
            : 'Para Ensino Fundamental, a série deve ser entre 1 e 9',
        path: ['series'],
      })
    }
  })

export type ClassFormValues = z.infer<typeof classFormSchema>

interface ClassFormProps {
  defaultValues?: ClassFormValues
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: ClassFormValues) => void
  onCancel: () => void
  submitLabel?: string
}

export function ClassForm({
  defaultValues,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
}: ClassFormProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loadingYears, setLoadingYears] = useState(true)

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: defaultValues ?? {
      year_id: '',
      education_level: 'FUNDAMENTAL',
      series: '',
      letter: '',
      shift: '',
    },
  })

  const educationLevel = form.watch('education_level') as EducationLevel
  const seriesOptions = getSeriesOptionsForLevel(educationLevel)

  useEffect(() => {
    academicYearsApi
      .list()
      .then(setAcademicYears)
      .catch(console.error)
      .finally(() => setLoadingYears(false))
  }, [])

  useEffect(() => {
    const currentSeries = form.getValues('series')
    if (currentSeries && !seriesOptions.includes(Number(currentSeries))) {
      form.setValue('series', '')
    }
  }, [educationLevel, form, seriesOptions])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-component border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Ano Letivo */}
        <FormField
          control={form.control}
          name="year_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano Letivo *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={loadingYears}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={loadingYears ? 'Carregando...' : 'Selecione o ano letivo'}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year}
                      {year.status === 'ACTIVE' ? ' (Ativo)' : ' (Fechado)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nível de Ensino */}
        <FormField
          control={form.control}
          name="education_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nível de Ensino *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível de ensino" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EDUCATION_LEVEL_OPTIONS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {EDUCATION_LEVEL_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Série */}
        <FormField
          control={form.control}
          name="series"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Série *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a série" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seriesOptions.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {formatSeriesLabel(s, educationLevel)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Letra */}
        <FormField
          control={form.control}
          name="letter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Letra *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a letra" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LETTER_OPTIONS.map((l) => (
                    <SelectItem key={l} value={l}>
                      Turma {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Turno */}
        <FormField
          control={form.control}
          name="shift"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turno *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SHIFT_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SHIFT_LABELS[s]}
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
          <Button type="submit" disabled={isSubmitting || loadingYears}>
            <Save size={16} />
            {isSubmitting ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
