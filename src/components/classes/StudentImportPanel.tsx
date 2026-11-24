'use client'

import { useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  FileUp,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UserRoundCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { classesApi } from '@/lib/api'
import {
  IMPORT_ISSUE_LABELS,
  findImportIssues,
  formatSchoolDocument,
} from '@/lib/school-document'
import { cn } from '@/lib/utils'
import type { ImportPreviewResponse, WizardImportedStudent } from '@/types/class'

const ACCEPT = '.pdf,.docx,.md,.txt'
const MODEL_HREF = '/modelos/lista-de-alunos-modelo.md'

/** Etapas que a tela mostra enquanto o arquivo é lido (a resposta costuma vir em <0,5s). */
const STEPS = [
  'Enviando o arquivo',
  'Lendo o documento',
  'Encontrando nomes e documentos',
  'Conferindo documentos e duplicados',
]
const STEP_MS = 420

type Phase =
  | { kind: 'idle' }
  | { kind: 'processing'; file: File; step: number }
  | { kind: 'error'; file: File; message: string }

interface StudentImportPanelProps {
  students: WizardImportedStudent[]
  onStudentsChange: (students: WizardImportedStudent[]) => void
}

export function StudentImportPanel({ students, onStudentsChange }: StudentImportPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  // Cada abertura da prévia remonta o modal: ele nasce com o último estado aprovado (ou a prévia crua).
  const [reviewSession, setReviewSession] = useState(0)

  function openReview() {
    setReviewSession((session) => session + 1)
    setReviewOpen(true)
  }

  async function processFile(file: File) {
    setPhase({ kind: 'processing', file, step: 0 })

    // As etapas andam no relógio enquanto a requisição corre; a prévia só abre
    // quando as duas coisas terminam, pra pessoa conseguir ler o que aconteceu.
    let step = 0
    const timer = window.setInterval(() => {
      step = Math.min(step + 1, STEPS.length - 1)
      setPhase((current) => (current.kind === 'processing' ? { ...current, step } : current))
    }, STEP_MS)

    try {
      const [result] = await Promise.all([
        classesApi.previewImport(file),
        new Promise((resolve) => setTimeout(resolve, STEP_MS * STEPS.length)),
      ])
      window.clearInterval(timer)
      setPreview(result)
      onStudentsChange([]) // arquivo novo invalida a aprovação anterior
      setPhase({ kind: 'idle' })
      openReview()
    } catch (error) {
      window.clearInterval(timer)
      setPhase({
        kind: 'error',
        file,
        message: error instanceof Error ? error.message : 'Não foi possível ler o arquivo.',
      })
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (file) void processFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasApproved = students.length > 0

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {phase.kind === 'processing' ? (
        <ProcessingCard file={phase.file} step={phase.step} />
      ) : hasApproved && preview ? (
        <ApprovedSummary
          students={students}
          fileName={preview.file_name}
          onReview={openReview}
          onReplace={() => inputRef.current?.click()}
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragging(false)
              handleFiles(event.dataTransfer.files)
            }}
            className={cn(
              'group flex w-full flex-col items-center gap-3 rounded-card border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25',
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-primary/25 bg-primary/[0.04] hover:border-primary/50 hover:bg-primary/[0.07]',
            )}
          >
            <span
              className={cn(
                'flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200',
                isDragging ? 'scale-110' : 'group-hover:-translate-y-0.5',
              )}
            >
              <FileUp size={26} aria-hidden="true" />
            </span>
            <span className="text-base font-semibold text-text-primary">
              {isDragging ? 'Solte o arquivo para ler a lista' : 'Arraste a lista de alunos para cá'}
            </span>
            <span className="text-sm text-text-secondary">
              ou <span className="font-semibold text-primary">clique para escolher</span> no computador
            </span>
            <span className="mt-1 flex flex-wrap justify-center gap-1.5">
              {['PDF', 'Word', 'Markdown', 'Texto'].map((label) => (
                <span key={label} className="status-pill status-pill-neutral">
                  {label}
                </span>
              ))}
            </span>
          </button>

          {preview && phase.kind === 'idle' && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-component bg-primary/[0.06] px-4 py-3 text-sm">
              <p className="text-text-primary">
                <span className="font-semibold">{preview.rows.length} alunos</span> lidos de {preview.file_name}, aguardando sua aprovação.
              </p>
              <Button type="button" size="sm" onClick={openReview}>
                Revisar e aprovar
              </Button>
            </div>
          )}

          {phase.kind === 'error' && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-component bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-semibold">Não deu para usar “{phase.file.name}”</p>
                <p className="mt-0.5">{phase.message}</p>
              </div>
            </div>
          )}

          <FormatHint />
        </>
      )}

      {preview && (
        <ReviewDialog
          key={reviewSession}
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          preview={preview}
          initialRows={hasApproved ? students : preview.rows}
          onApprove={(rows) => {
            onStudentsChange(rows)
            setReviewOpen(false)
          }}
        />
      )}
    </div>
  )
}

function FormatHint() {
  return (
    <div className="flex flex-col gap-3 rounded-component bg-neutral-100 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-text-primary">Um aluno por linha, neste padrão:</p>
        <p className="mt-1 font-mono text-xs text-text-secondary">
          Nome: Maria Clara Souza, Documento: 123.456.789-0
        </p>
      </div>
      <a
        href={MODEL_HREF}
        download
        className="link-action inline-flex shrink-0 items-center gap-1.5 text-sm"
      >
        <Download size={15} aria-hidden="true" />
        Baixar modelo
      </a>
    </div>
  )
}

function ProcessingCard({ file, step }: { file: File; step: number }) {
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="surface-card p-5" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-component bg-primary/10 text-primary">
          <FileText size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">{file.name}</p>
          <p className="text-xs text-text-secondary">{formatSize(file.size)}</p>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="mt-4 space-y-2.5">
        {STEPS.map((label, index) => {
          const done = index < step
          const current = index === step
          return (
            <li
              key={label}
              className={cn(
                'flex items-center gap-2.5 text-sm transition-colors',
                done ? 'text-text-secondary' : current ? 'font-medium text-text-primary' : 'text-text-tertiary',
              )}
            >
              {done ? (
                <CheckCircle2 size={17} className="shrink-0 text-success" aria-hidden="true" />
              ) : current ? (
                <Loader2 size={17} className="shrink-0 animate-spin text-primary" aria-hidden="true" />
              ) : (
                <span className="size-[17px] shrink-0 rounded-full border-2 border-neutral-300" aria-hidden="true" />
              )}
              {label}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function ApprovedSummary({
  students,
  fileName,
  onReview,
  onReplace,
}: {
  students: WizardImportedStudent[]
  fileName: string
  onReview: () => void
  onReplace: () => void
}) {
  const visible = students.slice(0, 6)

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-component bg-success-soft text-success">
            <UserRoundCheck size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {students.length} alunos prontos para matrícula
            </p>
            <p className="truncate text-xs text-text-secondary">Importados de {fileName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onReview}>
            Revisar lista
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onReplace}>
            <RefreshCw size={14} aria-hidden="true" />
            Trocar arquivo
          </Button>
        </div>
      </div>

      <ul className="divide-y divide-border border-t border-border">
        {visible.map((student) => (
          <li key={student.document} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
            <span className="truncate text-text-primary">{student.full_name}</span>
            <span className="tabular shrink-0 font-mono text-xs text-text-secondary">{student.document}</span>
          </li>
        ))}
      </ul>
      {students.length > visible.length && (
        <p className="border-t border-border px-5 py-2.5 text-xs text-text-secondary">
          e mais {students.length - visible.length} alunos
        </p>
      )}
    </div>
  )
}

type EditableRow = WizardImportedStudent & { key: number }

function ReviewDialog({
  open,
  onOpenChange,
  preview,
  initialRows,
  onApprove,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  preview: ImportPreviewResponse
  initialRows: WizardImportedStudent[]
  onApprove: (rows: WizardImportedStudent[]) => void
}) {
  const [rows, setRows] = useState<EditableRow[]>(() =>
    initialRows.map((row, key) => ({ key, full_name: row.full_name, document: row.document })),
  )
  const nextKey = useRef(initialRows.length)

  // "Já matriculado" só o servidor sabe; vale enquanto o documento não for editado.
  const registered = useMemo(
    () =>
      new Set(
        preview.rows.filter((row) => row.issues.includes('JA_CADASTRADO')).map((row) => row.document),
      ),
    [preview],
  )
  const issues = useMemo(() => findImportIssues(rows, registered), [rows, registered])
  const problemCount = issues.filter((list) => list.length > 0).length
  const readyCount = rows.length - problemCount

  function update(key: number, patch: Partial<WizardImportedStudent>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[88vh] max-w-3xl flex-col gap-0 p-0"
        // Sem isso o Radix foca (e seleciona) o primeiro nome. Melhor cair direto no primeiro erro.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const firstInvalid = (event.currentTarget as HTMLElement).querySelector<HTMLInputElement>(
            'input[aria-invalid="true"]',
          )
          firstInvalid?.focus()
        }}
      >
        <DialogHeader className="px-6 pb-4 pt-6 text-left">
          <DialogTitle>Confira os alunos encontrados</DialogTitle>
          <DialogDescription>
            Lemos <span className="font-medium text-text-primary">{preview.file_name}</span> ({preview.file_type}).
            Corrija o que estiver marcado, remova quem não entra nesta turma e aprove.
          </DialogDescription>
          <div className="flex flex-wrap gap-2 pt-3">
            <span className="status-pill status-pill-info">{rows.length} na lista</span>
            <span className="status-pill status-pill-success">
              <CheckCircle2 size={13} aria-hidden="true" />
              {readyCount} prontos
            </span>
            {problemCount > 0 && (
              <span className="status-pill status-pill-danger">
                <AlertCircle size={13} aria-hidden="true" />
                {problemCount} para corrigir
              </span>
            )}
            {preview.ignored_entries > 0 && (
              <span className="status-pill status-pill-warning">
                {preview.ignored_entries} fora do padrão, ignorados
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto border-y border-border" data-lenis-prevent>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-[0.06em] text-text-tertiary">
              <tr>
                <th className="w-10 px-4 py-2.5 font-semibold">#</th>
                <th className="px-2 py-2.5 font-semibold">Nome completo</th>
                <th className="w-44 px-2 py-2.5 font-semibold">Documento</th>
                <th className="w-40 px-2 py-2.5 font-semibold">Situação</th>
                <th className="w-12 px-2 py-2.5">
                  <span className="sr-only">Remover</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const rowIssues = issues[index]
                const hasIssue = rowIssues.length > 0
                const docIssue = rowIssues.some((issue) => issue !== 'NOME_INCOMPLETO')
                return (
                  <tr
                    key={row.key}
                    className={cn('border-t border-border transition-colors', hasIssue && 'bg-danger-soft/50')}
                  >
                    <td className="tabular px-4 py-2 text-xs text-text-tertiary">{index + 1}</td>
                    <td className="px-2 py-2">
                      <Input
                        value={row.full_name}
                        onChange={(event) => update(row.key, { full_name: event.target.value })}
                        aria-label={`Nome do aluno ${index + 1}`}
                        aria-invalid={rowIssues.includes('NOME_INCOMPLETO') || undefined}
                        className="h-9"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={row.document}
                        onChange={(event) => update(row.key, { document: event.target.value })}
                        onBlur={(event) => update(row.key, { document: formatSchoolDocument(event.target.value) })}
                        inputMode="numeric"
                        placeholder="000.000.000-0"
                        aria-label={`Documento do aluno ${index + 1}`}
                        aria-invalid={docIssue || undefined}
                        className="tabular h-9 font-mono text-[13px]"
                      />
                    </td>
                    <td className="px-2 py-2">
                      {hasIssue ? (
                        <span className="status-pill status-pill-danger">
                          {IMPORT_ISSUE_LABELS[rowIssues[0]]}
                        </span>
                      ) : (
                        <span className="status-pill status-pill-success">
                          <CheckCircle2 size={13} aria-hidden="true" />
                          Pronto
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                        aria-label={`Remover ${row.full_name || `aluno ${index + 1}`}`}
                        className="icon-button inline-flex size-8 items-center justify-center rounded-full text-text-tertiary hover:text-danger"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRows((current) => [...current, { key: nextKey.current++, full_name: '', document: '' }])}
            >
              <Plus size={15} aria-hidden="true" />
              Adicionar aluno
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-secondary">
            {problemCount > 0
              ? 'Corrija ou remova as linhas marcadas para liberar a aprovação.'
              : 'Tudo certo. RM, e-mail e senha provisória são gerados ao criar a turma.'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={problemCount > 0 || rows.length === 0}
              onClick={() =>
                onApprove(
                  rows.map((row) => ({
                    full_name: row.full_name.trim().replace(/\s+/g, ' '),
                    document: formatSchoolDocument(row.document),
                  })),
                )
              }
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              Aprovar {rows.length} {rows.length === 1 ? 'aluno' : 'alunos'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}
