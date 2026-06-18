'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Lock, Save } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
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
import { Label } from '@/components/ui/label'
import { teachersApi } from '@/lib/api'
import { cn } from '@/lib/utils'

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres.'),
    confirm_password: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória.'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'As senhas não coincidem.',
    path: ['confirm_password'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

interface TeacherPasswordSectionProps {
  teacherId: string
}

export function TeacherPasswordSection({ teacherId }: TeacherPasswordSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirm_password: '',
    },
  })

  const handleToggleExpand = () => {
    if (isExpanded) {
      form.reset()
      setSubmitError(null)
    }
    setIsExpanded((prev) => !prev)
  }

  const handleSubmit = async (values: PasswordFormValues) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await teachersApi.updatePassword(teacherId, { password: values.password })

      toast.success('Senha redefinida com sucesso!', {
        description: 'O professor já pode acessar o sistema com a nova senha.',
      })

      form.reset()
      setIsExpanded(false)
    } catch (err: unknown) {
      console.error('Erro ao redefinir senha:', err)
      const message = err instanceof Error ? err.message : undefined
      setSubmitError(
        message || 'Não foi possível redefinir a senha. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label>Senha de acesso</Label>
          <div className="relative">
            <Input
              type="password"
              value="••••••••"
              readOnly
              disabled
              aria-label="Senha atual (oculta por segurança)"
              className={cn(
                'cursor-default bg-muted pr-10 text-muted-foreground',
                'disabled:cursor-default disabled:opacity-100',
              )}
            />
            <Lock
              size={16}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1 font-normal">
              <Lock size={12} aria-hidden />
              Protegida
            </Badge>
            <p className="text-xs text-muted-foreground">
              Por segurança, a senha atual não pode ser visualizada.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant={isExpanded ? 'outline' : 'default'}
          onClick={handleToggleExpand}
          disabled={isSubmitting}
          className="shrink-0"
        >
          <KeyRound size={16} />
          {isExpanded ? 'Cancelar' : 'Alterar senha'}
        </Button>
      </div>

      {isExpanded && (
        <div className="rounded-component border border-border bg-muted/20 p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {submitError && (
                <div className="rounded-component border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  {submitError}
                </div>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nova senha *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Repita a nova senha"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  <Save size={16} />
                  {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  )
}
