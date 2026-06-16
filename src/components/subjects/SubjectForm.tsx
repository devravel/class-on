'use client'

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
import { Input } from '@/components/ui/input'

const subjectFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres.')
    .max(255, 'Nome deve ter no máximo 255 caracteres.'),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória.')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres.'),
})

export type SubjectFormValues = z.infer<typeof subjectFormSchema>

interface SubjectFormProps {
  defaultValues?: SubjectFormValues
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: SubjectFormValues) => void
  onCancel: () => void
  submitLabel?: string
}

export function SubjectForm({
  defaultValues,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
}: SubjectFormProps) {
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: defaultValues ?? {
      name: '',
      description: '',
    },
  })

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da disciplina *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Matemática" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição *</FormLabel>
              <FormControl>
                <textarea
                  placeholder="Ex: Disciplina de matemática básica e avançada"
                  className="w-full min-h-[100px] rounded-component border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 transition-all resize-y"
                  {...field}
                />
              </FormControl>
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
