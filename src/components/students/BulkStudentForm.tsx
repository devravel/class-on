'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Save, Trash2 } from 'lucide-react'

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

const bulkStudentItemSchema = z.object({
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

const bulkStudentFormSchema = z.object({
  students: z.array(bulkStudentItemSchema).min(1, 'Adicione pelo menos um aluno.'),
})

export type BulkStudentFormValues = z.infer<typeof bulkStudentFormSchema>

interface BulkStudentFormProps {
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: BulkStudentFormValues) => void
  onCancel: () => void
}

export function BulkStudentForm({
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: BulkStudentFormProps) {
  const form = useForm<BulkStudentFormValues>({
    resolver: zodResolver(bulkStudentFormSchema),
    defaultValues: {
      students: [{ full_name: '', email: '', rm: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'students',
  })

  const handleAddStudent = () => {
    append({ full_name: '', email: '', rm: '' })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-component border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative rounded-component border border-border bg-muted/30 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">
                  Aluno {index + 1}
                </h3>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                  >
                    <Trash2 size={14} />
                    Remover
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name={`students.${index}.full_name`}
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
                  name={`students.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Ex: maria@escola.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`students.${index}.rm`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RM *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: ALU001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAddStudent}
          disabled={isSubmitting}
          className="w-full"
        >
          <Plus size={16} />
          Adicionar outro aluno
        </Button>

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
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Alunos'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
