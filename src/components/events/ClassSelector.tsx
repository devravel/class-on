'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Class, classesApi } from '@/lib/api/classes'
import { getClassShortLabel } from '@/lib/class-utils'
import { ApiError } from '@/lib/api-client'

interface ClassSelectorProps {
  value?: string
  onChange: (classId: string | undefined) => void
  label?: string
  placeholder?: string
  allowEmpty?: boolean
}

export function ClassSelector({ 
  value, 
  onChange, 
  label = "Turma", 
  placeholder = "Selecione uma turma",
  allowEmpty = true 
}: ClassSelectorProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const data = await classesApi.getAll()
        setClasses(data)
      } catch (err) {
        console.error('Erro ao carregar turmas:', err)
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Erro ao carregar turmas')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadClasses()
  }, [])

  const handleValueChange = (newValue: string) => {
    if (newValue === 'empty') {
      onChange(undefined)
    } else {
      onChange(newValue)
    }
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="rounded-md border border-danger/20 bg-danger/5 p-3">
          <p className="text-sm text-danger">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select 
        value={value || (allowEmpty ? 'empty' : undefined)} 
        onValueChange={handleValueChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Carregando turmas..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty && (
            <SelectItem value="empty">
              <span className="text-text-secondary">Todas as turmas</span>
            </SelectItem>
          )}
          
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {getClassShortLabel(cls)}
                </span>
                <span className="text-text-secondary text-sm">
                  {cls.shift}
                </span>
              </div>
            </SelectItem>
          ))}
          
          {classes.length === 0 && !isLoading && (
            <SelectItem value="no-classes" disabled>
              <span className="text-text-secondary">Nenhuma turma encontrada</span>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}