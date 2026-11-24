'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCheck,
  Loader2,
  MessagesSquare,
  Search,
  Send,
  Sparkles,
  UserCheck,
  WandSparkles,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { conversationsApi } from '@/lib/api'
import { formatGrade, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ConversationContact, ConversationThread } from '@/types/conversation'

const THREAD_POLL_MS = 5000
const CONTACTS_POLL_MS = 15000

type Role = 'ALUNO' | 'PROFESSOR'

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

function timeLabel(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
        size === 'lg' ? 'size-11 text-sm' : 'size-10 text-xs',
      )}
    >
      {initials(name)}
    </span>
  )
}

export function ConversationsView({ role }: { role: Role }) {
  const isStudent = role === 'ALUNO'
  const [contacts, setContacts] = useState<ConversationContact[]>([])
  const [attention, setAttention] = useState<ConversationContact[]>([])
  const [query, setQuery] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadContacts = useCallback(async () => {
    try {
      if (isStudent) {
        setContacts(await conversationsApi.studentContacts())
      } else {
        const result = await conversationsApi.teacherContacts(query)
        setContacts(result.open)
        setAttention(result.suggested)
      }
    } catch {
      // Lista lateral falhar não pode derrubar a conversa aberta; a próxima rodada tenta de novo.
    } finally {
      setLoadingContacts(false)
    }
  }, [isStudent, query])

  useEffect(() => {
    const first = window.setTimeout(loadContacts, query ? 300 : 0)
    const poll = window.setInterval(loadContacts, CONTACTS_POLL_MS)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(poll)
    }
  }, [loadContacts, query])

  const all = useMemo(() => [...contacts, ...attention], [contacts, attention])
  const selected = all.find((contact) => contact.id === selectedId) ?? null

  return (
    <div className="grid h-[calc(100dvh-13rem)] min-h-[520px] gap-5 lg:grid-cols-[340px_1fr]">
      <aside
        className={cn('surface-card flex min-h-0 flex-col overflow-hidden', selectedId && 'hidden lg:flex')}
        aria-label={isStudent ? 'Seus professores' : 'Conversas com alunos'}
      >
        <div className="border-b border-border px-4 py-3.5">
          <p className="text-sm font-semibold text-text-primary">
            {isStudent ? 'Seus professores' : 'Conversas'}
          </p>
          <p className="text-xs text-text-secondary">
            {isStudent
              ? 'Todos que dão aula pra você, prontos pra conversar'
              : 'Mensagens dos alunos e quem precisa de atenção'}
          </p>
          {!isStudent && (
            <div className="relative mt-3">
              <Search size={15} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar aluno pelo nome…"
                aria-label="Buscar aluno pelo nome"
                className="h-9 pl-9"
              />
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto" data-lenis-prevent>
          {loadingContacts ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
            </div>
          ) : (
            <>
              <ContactList contacts={contacts} selectedId={selectedId} onSelect={setSelectedId} isStudent={isStudent} />
              {!isStudent && (
                <>
                  {contacts.length === 0 && !query && (
                    <p className="px-4 py-6 text-center text-xs text-text-secondary">Nenhuma conversa ainda.</p>
                  )}
                  {attention.length > 0 && (
                    <>
                      <p className="flex items-center gap-1.5 px-4 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                        {query ? (
                          'Resultado da busca'
                        ) : (
                          <>
                            <Sparkles size={12} aria-hidden="true" className="text-primary" />
                            Precisam de atenção
                          </>
                        )}
                      </p>
                      <ContactList contacts={attention} selectedId={selectedId} onSelect={setSelectedId} isStudent={false} />
                    </>
                  )}
                  {query && attention.length === 0 && contacts.length === 0 && (
                    <p className="px-4 py-6 text-center text-xs text-text-secondary">Nenhum aluno encontrado.</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </aside>

      <section className={cn('surface-card flex min-h-0 flex-col overflow-hidden', !selectedId && 'hidden lg:flex')}>
        {selected ? (
          <Thread
            key={selected.id}
            contact={selected}
            isStudent={isStudent}
            onBack={() => setSelectedId(null)}
            onActivity={loadContacts}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessagesSquare size={26} aria-hidden="true" />
            </span>
            <p className="text-base font-semibold text-text-primary">
              {isStudent ? 'Escolha um professor para conversar' : 'Escolha uma conversa'}
            </p>
            <p className="max-w-sm text-sm text-text-secondary">
              {isStudent
                ? 'Ao abrir, você já vê o que tem pendente com ele e sugestões do que escrever.'
                : 'Ao abrir, você vê notas, frequência e entregas do aluno na sua disciplina, com sugestões de mensagem.'}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

function ContactList({
  contacts,
  selectedId,
  onSelect,
  isStudent,
}: {
  contacts: ConversationContact[]
  selectedId: string | null
  onSelect: (id: string) => void
  isStudent: boolean
}) {
  return (
    <ul>
      {contacts.map((contact) => {
        const active = contact.id === selectedId
        const preview = contact.last_message
          ? `${contact.last_message.mine ? 'Você: ' : ''}${contact.last_message.content}`
          : null
        return (
          <li key={contact.id}>
            <button
              type="button"
              onClick={() => onSelect(contact.id)}
              aria-current={active || undefined}
              className={cn(
                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                active ? 'bg-primary/10' : 'hover:bg-neutral-100',
              )}
            >
              <Avatar name={contact.name} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={cn('truncate text-sm text-text-primary', contact.unread ? 'font-bold' : 'font-semibold')}>
                    {contact.name}
                  </span>
                  {contact.last_message && (
                    <span className="tabular shrink-0 text-[11px] text-text-tertiary">
                      {timeLabel(contact.last_message.created_at)}
                    </span>
                  )}
                </span>
                <span className="block truncate text-xs text-text-secondary">{contact.subtitle}</span>
                <span className="mt-1 flex items-center gap-1.5">
                  {preview && (
                    <span className={cn('min-w-0 flex-1 truncate text-xs', contact.unread ? 'font-medium text-text-primary' : 'text-text-tertiary')}>
                      {preview}
                    </span>
                  )}
                  {!preview && isStudent && contact.pending_tasks > 0 && (
                    <span className="status-pill status-pill-warning !px-2 !py-0.5 !text-[11px]">
                      {contact.pending_tasks} {contact.pending_tasks === 1 ? 'tarefa pendente' : 'tarefas pendentes'}
                    </span>
                  )}
                  {!preview && isStudent && contact.pending_tasks === 0 && (
                    <span className="text-xs text-text-tertiary">Iniciar conversa</span>
                  )}
                  {!isStudent && contact.attention && (
                    <span className="status-pill status-pill-danger shrink-0 !px-2 !py-0.5 !text-[11px]">
                      {contact.attention}
                    </span>
                  )}
                  {contact.unread > 0 && (
                    <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      {contact.unread}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function Thread({
  contact,
  isStudent,
  onBack,
  onActivity,
}: {
  contact: ConversationContact
  isStudent: boolean
  onBack: () => void
  onActivity: () => void
}) {
  const [thread, setThread] = useState<ConversationThread | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastCount = useRef(0)

  const load = useCallback(async () => {
    try {
      setThread(await conversationsApi.thread(contact.id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível abrir a conversa.')
    }
  }, [contact.id])

  useEffect(() => {
    void load().then(onActivity) // abrir marca como lida: a lista lateral atualiza o contador
    const poll = window.setInterval(load, THREAD_POLL_MS)
    return () => window.clearInterval(poll)
  }, [load, onActivity])

  // Rola pro fim só quando chega mensagem nova (não a cada polling).
  useEffect(() => {
    const count = thread?.messages.length ?? 0
    if (count !== lastCount.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    lastCount.current = count
  }, [thread?.messages.length])

  async function send() {
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    try {
      const message = await conversationsApi.send(contact.id, content)
      setThread((current) => (current ? { ...current, messages: [...current.messages, message] } : current))
      setText('')
      onActivity()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mensagem não enviada.')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  async function draft() {
    setDrafting(true)
    try {
      const result = await conversationsApi.draft(contact.id)
      setText(result.text)
      if (result.source === 'local') toast.message('IA indisponível agora: usei a melhor sugestão do sistema.')
      inputRef.current?.focus()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar o rascunho.')
    } finally {
      setDrafting(false)
    }
  }

  const name = thread?.other.name ?? contact.name
  const first = name.split(' ')[0]

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar para a lista"
          className="icon-button inline-flex size-9 items-center justify-center rounded-full lg:hidden"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <Avatar name={name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
          <p className="truncate text-xs text-text-secondary">{thread?.other.subtitle ?? contact.subtitle}</p>
        </div>
      </header>

      {thread && <ContextStrip thread={thread} isStudent={isStudent} />}

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4" data-lenis-prevent aria-live="polite">
        {!thread ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
          </div>
        ) : thread.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-semibold text-text-primary">Comece a conversa com {first}</p>
            <p className="max-w-xs text-xs text-text-secondary">
              As sugestões abaixo já levam em conta notas, frequência e entregas de vocês.
            </p>
          </div>
        ) : (
          thread.messages.map((message, index) => {
            const isLastMine = message.mine && thread.messages.slice(index + 1).every((m) => !m.mine)
            return (
              <div key={message.id} className={cn('flex flex-col', message.mine ? 'items-end' : 'items-start')}>
                <p
                  className={cn(
                    'max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                    message.mine
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md bg-neutral-200 text-text-primary',
                  )}
                >
                  {message.content}
                </p>
                <span className="mt-0.5 flex items-center gap-1 px-1 text-[11px] text-text-tertiary">
                  {timeLabel(message.created_at)}
                  {isLastMine && message.read && (
                    <>
                      <CheckCheck size={12} className="text-primary" aria-hidden="true" />
                      Lida
                    </>
                  )}
                </span>
              </div>
            )
          })
        )}
      </div>

      {thread && thread.suggestions.length > 0 && (
        <div className="border-t border-border px-4 pt-3">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
            <Sparkles size={12} aria-hidden="true" className="text-primary" />
            Sugestões para agora
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1" data-lenis-prevent>
            {thread.suggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                title={suggestion.text}
                onClick={() => {
                  setText(suggestion.text)
                  inputRef.current?.focus()
                }}
                className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="flex items-end gap-2 px-4 py-3"
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
      >
        <textarea
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void send()
            }
          }}
          rows={Math.min(4, Math.max(1, text.split('\n').length, Math.ceil(text.length / 70)))}
          placeholder={`Mensagem para ${first}…`}
          aria-label={`Mensagem para ${name}`}
          maxLength={2000}
          className="min-h-10 flex-1 resize-none rounded-component bg-neutral-200 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
        />
        <Button type="button" variant="outline" onClick={draft} disabled={drafting || !thread} title="Escrever um rascunho com IA">
          {drafting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <WandSparkles size={16} aria-hidden="true" />}
          <span className="hidden sm:inline">{drafting ? 'Escrevendo…' : 'Escrever com IA'}</span>
        </Button>
        <Button type="submit" disabled={!text.trim() || sending} aria-label="Enviar mensagem">
          {sending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
        </Button>
      </form>
    </>
  )
}

/** O que está acontecendo entre os dois agora: notas, frequência e entregas da disciplina. */
function ContextStrip({ thread, isStudent }: { thread: ConversationThread; isStudent: boolean }) {
  const facts: Array<{ key: string; icon: typeof BookOpen; text: string; tone: 'ok' | 'warn' | 'bad' }> = []

  for (const subject of thread.context.subjects) {
    if (subject.average != null) {
      facts.push({
        key: `avg-${subject.subject}`,
        icon: BookOpen,
        text: `${subject.subject}: média ${formatGrade(subject.average)}`,
        tone: subject.average < 6 ? 'bad' : subject.average < 7 ? 'warn' : 'ok',
      })
    }
    if (subject.attendance_rate != null) {
      facts.push({
        key: `freq-${subject.subject}`,
        icon: UserCheck,
        text: `Frequência ${formatPercent(subject.attendance_rate)}`,
        tone: subject.attendance_rate < 75 ? 'bad' : subject.attendance_rate < 85 ? 'warn' : 'ok',
      })
    }
  }
  for (const task of thread.context.overdue) {
    facts.push({ key: `late-${task.id}`, icon: AlertTriangle, text: `Atrasada: ${task.title}`, tone: 'bad' })
  }
  for (const task of thread.context.pending) {
    facts.push({ key: `pend-${task.id}`, icon: CalendarClock, text: `${task.title} · vence ${dayLabel(task.deadline)}`, tone: 'warn' })
  }

  if (facts.length === 0) return null

  return (
    <div className="border-b border-border bg-neutral-50 px-4 py-2.5">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
        {isStudent ? 'Você com este professor' : 'Este aluno na sua disciplina'}
        {thread.context.delivered > 0 && (
          <span className="normal-case tracking-normal"> · {thread.context.delivered} entregue{thread.context.delivered > 1 ? 's' : ''}</span>
        )}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {facts.map(({ key, icon: Icon, text, tone }) => (
          <li
            key={key}
            className={cn(
              'status-pill !py-0.5 !text-[11px]',
              tone === 'bad' ? 'status-pill-danger' : tone === 'warn' ? 'status-pill-warning' : 'status-pill-success',
            )}
          >
            <Icon size={12} aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}
