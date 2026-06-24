'use client'

import {
  FileText,
  Globe,
  Link2,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  UploadCloud,
  Wand2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { aiApi, assignmentsApi, authApi } from '@/lib/api'
import { getClassLabel } from '@/lib/class-utils'
import { cn } from '@/lib/utils'
import { AiTaskSource } from '@/types/ai'

type GeneratorStep = 'config' | 'review'

interface AiTaskGeneratorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultClassLabel?: string
  defaultTitle?: string
  onInsert: (result: { title: string; content: string }) => void
}

const MAX_PDF_SIZE = 10 * 1024 * 1024

export function AiTaskGeneratorModal({
  open,
  onOpenChange,
  defaultClassLabel,
  defaultTitle,
  onInsert,
}: AiTaskGeneratorModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [step, setStep] = useState<GeneratorStep>('config')
  const [title, setTitle] = useState(defaultTitle ?? '')
  const [schoolYear, setSchoolYear] = useState(defaultClassLabel ?? '')
  const [searchWeb, setSearchWeb] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [linkInput, setLinkInput] = useState('')
  const [links, setLinks] = useState<string[]>([])

  const [classOptions, setClassOptions] = useState<string[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)

  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [content, setContent] = useState('')
  const [refinePrompt, setRefinePrompt] = useState('')
  const [sources, setSources] = useState<AiTaskSource[]>([])
  const [fallbackUsed, setFallbackUsed] = useState(false)

  const resetState = useCallback(() => {
    setStep('config')
    setTitle(defaultTitle ?? '')
    setSchoolYear(defaultClassLabel ?? '')
    setSearchWeb(false)
    setFile(null)
    setIsDragging(false)
    setLinkInput('')
    setLinks([])
    setContent('')
    setRefinePrompt('')
    setSources([])
    setFallbackUsed(false)
  }, [defaultClassLabel, defaultTitle])

  useEffect(() => {
    if (!open) return

    setTitle((current) => current || (defaultTitle ?? ''))
    setSchoolYear((current) => current || (defaultClassLabel ?? ''))

    const loadClasses = async () => {
      try {
        setIsLoadingClasses(true)
        const me = await authApi.getMe()
        if (!me.teacher) {
          if (defaultClassLabel) setClassOptions([defaultClassLabel])
          return
        }
        const assignments = await assignmentsApi.getByTeacher(me.teacher.id)
        const labels = Array.from(
          new Set(assignments.map((a) => getClassLabel(a.classes))),
        )
        if (defaultClassLabel && !labels.includes(defaultClassLabel)) {
          labels.unshift(defaultClassLabel)
        }
        setClassOptions(labels)
      } catch {
        if (defaultClassLabel) setClassOptions([defaultClassLabel])
      } finally {
        setIsLoadingClasses(false)
      }
    }
    loadClasses()
  }, [open, defaultClassLabel, defaultTitle])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetState()
    }
    onOpenChange(next)
  }

  const validatePdf = (candidate: File): boolean => {
    const isPdf =
      candidate.type === 'application/pdf' ||
      candidate.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      toast.error('Envie apenas arquivos no formato PDF.')
      return false
    }
    if (candidate.size > MAX_PDF_SIZE) {
      toast.error('O arquivo deve ter no máximo 10 MB.')
      return false
    }
    return true
  }

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return
    if (!validatePdf(selected)) return
    setFile(selected)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const dropped = event.dataTransfer.files?.[0] ?? null
    handleFileSelect(dropped)
  }

  const handleAddLink = () => {
    const value = linkInput.trim()
    if (!value) return
    setLinks((prev) => (prev.includes(value) ? prev : [...prev, value]))
    setLinkInput('')
  }

  const handleLinkKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddLink()
    }
  }

  const handleGenerate = async () => {
    if (title.trim().length < 3) {
      toast.error('Informe um título com pelo menos 3 caracteres.')
      return
    }
    if (!schoolYear.trim()) {
      toast.error('Selecione o ano/turma da escola.')
      return
    }

    try {
      setIsGenerating(true)
      const result = await aiApi.generateTask({
        title: title.trim(),
        schoolYear: schoolYear.trim(),
        searchWeb,
        links,
        file,
      })
      setContent(result.content)
      setSources(result.sources)
      setFallbackUsed(result.fallbackUsed)
      setStep('review')
      if (result.fallbackUsed) {
        toast.warning(
          'A IA demorou para responder. Geramos um modelo estruturado de contingência.',
        )
      } else {
        toast.success('Tarefa gerada com sucesso!')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao gerar a tarefa.'
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefine = async () => {
    if (!refinePrompt.trim()) {
      toast.error('Descreva o ajuste que deseja para a IA.')
      return
    }

    try {
      setIsRefining(true)
      const result = await aiApi.generateTask({
        title: title.trim(),
        schoolYear: schoolYear.trim(),
        searchWeb,
        links,
        file,
        refinePrompt: refinePrompt.trim(),
        historyText: content,
      })
      setContent(result.content)
      setSources(result.sources)
      setFallbackUsed(result.fallbackUsed)
      setRefinePrompt('')
      if (result.fallbackUsed) {
        toast.warning('A IA demorou para responder ao ajuste solicitado.')
      } else {
        toast.success('Ajuste aplicado pela IA!')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao refinar a tarefa.'
      toast.error(message)
    } finally {
      setIsRefining(false)
    }
  }

  const handleRestart = () => {
    setStep('config')
    setContent('')
    setRefinePrompt('')
    setSources([])
    setFallbackUsed(false)
  }

  const handleConfirm = () => {
    if (!content.trim()) {
      toast.error('Não há conteúdo para inserir.')
      return
    }
    onInsert({ title: title.trim(), content: content.trim() })
    resetState()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Gerar tarefa com IA
          </DialogTitle>
          <DialogDescription>
            {step === 'config'
              ? 'Configure a base da tarefa e deixe o Copiloto ClassOn criar as questões.'
              : 'Revise, edite e refine o conteúdo gerado antes de inserir na tarefa.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'config' ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-task-title">Título da tarefa</Label>
              <Input
                id="ai-task-title"
                placeholder="Ex: Frações e operações com números racionais"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="ai-task-year">Ano da escola</Label>
              <select
                id="ai-task-year"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                disabled={isLoadingClasses}
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-text-primary focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 disabled:opacity-60"
              >
                <option value="">
                  {isLoadingClasses
                    ? 'Carregando turmas...'
                    : 'Selecione uma turma'}
                </option>
                {classOptions.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setSearchWeb((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-neutral-50"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Globe size={16} className="text-primary" />
                Procurar na Web
                <span className="text-xs font-normal text-text-secondary">
                  (fontes educacionais reais)
                </span>
              </span>
              <span
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                  searchWeb ? 'bg-primary' : 'bg-neutral-300',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                    searchWeb ? 'left-[22px]' : 'left-0.5',
                  )}
                />
              </span>
            </button>

            <div>
              <Label>Adicionar arquivos base para tarefa (PDF)</Label>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:bg-neutral-50',
                )}
              >
                <UploadCloud size={22} className="text-primary" />
                <p className="text-sm text-text-secondary">
                  Arraste e solte um PDF aqui ou{' '}
                  <span className="font-medium text-primary">
                    clique para selecionar
                  </span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    handleFileSelect(e.target.files?.[0] ?? null)
                  }
                />
              </div>
              {file && (
                <div className="mt-2 flex items-center justify-between rounded-lg border border-border bg-neutral-50 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-text-primary">
                    <FileText size={16} className="text-primary" />
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-text-secondary hover:text-destructive"
                    aria-label="Remover arquivo"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="ai-task-link">Links de referência</Label>
              <div className="mt-1 flex gap-2">
                <div className="relative flex-1">
                  <Link2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                  <Input
                    id="ai-task-link"
                    placeholder="https://..."
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={handleLinkKeyDown}
                    className="pl-9"
                  />
                </div>
                <Button type="button" variant="outline" onClick={handleAddLink}>
                  <Plus size={16} />
                  Adicionar
                </Button>
              </div>
              {links.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {links.map((link) => (
                    <li
                      key={link}
                      className="flex items-center justify-between rounded-md border border-border bg-neutral-50 px-3 py-1.5 text-xs"
                    >
                      <span className="truncate text-text-secondary">
                        {link}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setLinks((prev) => prev.filter((l) => l !== link))
                        }
                        className="ml-2 shrink-0 text-text-secondary hover:text-destructive"
                        aria-label="Remover link"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                Gerar tarefa
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {fallbackUsed && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Modelo de contingência: a IA não respondeu a tempo. Você pode
                editar o conteúdo manualmente ou tentar refazer.
              </div>
            )}

            <div>
              <Label htmlFor="ai-task-content">
                Conteúdo gerado (editável)
              </Label>
              <Textarea
                id="ai-task-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="mt-1 font-mono text-xs leading-relaxed"
              />
            </div>

            {sources.length > 0 && (
              <div className="rounded-lg border border-border bg-neutral-50 px-3 py-2">
                <p className="mb-1 text-xs font-semibold text-text-primary">
                  Fontes utilizadas
                </p>
                <ul className="space-y-0.5">
                  {sources.map((source) => (
                    <li key={source.url} className="truncate text-xs">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Label htmlFor="ai-task-refine" className="text-text-primary">
                Refinar com a IA
              </Label>
              <div className="mt-1 flex gap-2">
                <Input
                  id="ai-task-refine"
                  placeholder="Pedir ajuste específico para a IA..."
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleRefine()
                    }
                  }}
                  disabled={isRefining}
                />
                <Button
                  type="button"
                  onClick={handleRefine}
                  disabled={isRefining}
                >
                  {isRefining ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Wand2 size={16} />
                  )}
                  Ajustar
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleRestart}
                disabled={isRefining}
              >
                <RotateCcw size={16} />
                Refazer do zero
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isRefining}
              >
                <Plus size={16} />
                Confirmar e Inserir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
