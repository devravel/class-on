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

const studentFormSchema = z.object({
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

export type StudentFormValues = z.infer<typeof studentFormSchema>

interface StudentFormProps {
  defaultValues?: StudentFormValues
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: StudentFormValues) => void
  onCancel: () => void
  submitLabel?: string
}

export function StudentForm({
  defaultValues,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
}: StudentFormProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: defaultValues ?? {
      full_name: '',
      email: '',
      rm: '',
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
              <FormLabel>RM (Registro de Matrícula) *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: ALU001" {...field} />
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
