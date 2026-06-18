'use client'

import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Section } from '@/components/dashboard/Section'
import { getClassLabel } from '@/lib/class-utils'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { studentsApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Student } from '@/types/student'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const updateStudentSchema = z.object({
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
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED']),
})

type UpdateStudentFormValues = z.infer<typeof updateStudentSchema>

export default function EditarAlunoPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<UpdateStudentFormValues>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      full_name: '',
      email: '',
      rm: '',
      status: 'ACTIVE',
    },
  })

  useEffect(() => {
    loadStudent()
  }, [studentId])

  const loadStudent = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await studentsApi.getById(studentId)
      setStudent(data)
      form.reset({
        full_name: data.full_name,
        email: data.users.email,
        rm: data.rm,
        status: data.status as 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED',
      })
    } catch (err) {
      console.error('Erro ao carregar aluno:', err)
      setError('Não foi possível carregar os dados do aluno.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (values: UpdateStudentFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await studentsApi.update(studentId, values)
      router.push('/secretaria/alunos')
    } catch (err: unknown) {
      console.error('Erro ao atualizar aluno:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(message || 'Não foi possível atualizar o aluno. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageContainer>
    )
  }

  if (error && !student) {
    return (
      <PageContainer>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/secretaria/alunos"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
            aria-label="Voltar para alunos"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Editar Aluno</h1>
        </div>
        <p className="text-sm text-text-secondary">
          Atualize as informações do aluno
        </p>
      </div>

      <Section
        title="Informações do Aluno"
        description="Edite os dados de identificação do aluno"
      >
        <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
          <div className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Ativo</SelectItem>
                          <SelectItem value="INACTIVE">Inativo</SelectItem>
                          <SelectItem value="TRANSFERRED">Transferido</SelectItem>
                          <SelectItem value="GRADUATED">Formado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {student?.enrollments && student.enrollments.length > 0 && (
                  <div className="rounded-component border border-border bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-medium text-text-primary">
                      Turmas matriculadas:
                    </p>
                    <ul className="space-y-1">
                      {student.enrollments.map((enrollment) => (
                        <li
                          key={enrollment.id}
                          className="text-sm text-text-secondary"
                        >
                          • {enrollment.classes.academic_years.year} -{' '}
                          {getClassLabel(enrollment.classes)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/secretaria/alunos')}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save size={16} />
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </Section>
    </PageContainer>
  )
}
