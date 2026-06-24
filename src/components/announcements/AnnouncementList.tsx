'use client'

import { useEffect, useState } from 'react'
import { Plus, Filter, Search, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AnnouncementCard } from './AnnouncementCard'
import { AnnouncementForm } from './AnnouncementForm'
import { AnnouncementStats } from './AnnouncementStats'
import { InlineError } from '@/components/dashboard/InlineError'
import { PageLoader } from '@/components/ui/page-loader'
import { Announcement, CreateAnnouncementDto } from '@/types/announcement'
import { announcementsApi } from '@/lib/api/announcements'
import { useAuth } from '@/contexts/auth-context'
import { usePageHeaderTitle } from '@/contexts/page-header-context'
import { toast } from 'sonner'

interface AnnouncementListProps {
  showCreateButton?: boolean
  title?: string
  emptyMessage?: string
}

export function AnnouncementList({
  showCreateButton = true,
  title = 'Comunicados',
  emptyMessage = 'Nenhum comunicado encontrado.',
}: AnnouncementListProps) {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showStats, setShowStats] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [scopeFilter, setScopeFilter] = useState<string>('all')

  // Carregar comunicados
  const loadAnnouncements = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await announcementsApi.findAll()
      const items = Array.isArray(data) ? data : []
      setAnnouncements(items)
      setFilteredAnnouncements(items)
    } catch (err) {
      console.error('Erro ao carregar comunicados:', err)
      setError('Erro ao carregar comunicados. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    let filtered = announcements

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (announcement) => announcement.status === statusFilter
      )
    }

    // Filtro por escopo
    if (scopeFilter !== 'all') {
      filtered = filtered.filter(
        (announcement) => announcement.scope_type === scopeFilter
      )
    }

    setFilteredAnnouncements(filtered)
  }, [announcements, searchTerm, statusFilter, scopeFilter])

  // Carregar dados na montagem
  useEffect(() => {
    loadAnnouncements()
  }, [])

  // Criar comunicado
  const handleCreate = async (dto: CreateAnnouncementDto) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await announcementsApi.create(dto)
      toast.success('Comunicado enviado com sucesso!')
      setShowForm(false)
      loadAnnouncements()
    } catch (err) {
      console.error('Erro ao criar comunicado:', err)
      setError('Erro ao criar comunicado. Verifique os dados e tente novamente.')
      toast.error('Erro ao enviar comunicado')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Marcar como lido
  const handleMarkAsRead = async (id: string) => {
    try {
      await announcementsApi.markAsRead(id)
      // Atualizar localmente (opcional, pois o card já muda visualmente)
    } catch (err) {
      console.error('Erro ao marcar como lido:', err)
      toast.error('Erro ao marcar comunicado como lido')
    }
  }

  // Arquivar/desarquivar
  const handleArchive = async (id: string, status: 'ACTIVE' | 'ARCHIVED') => {
    try {
      await announcementsApi.archive(id, { status })
      toast.success(
        status === 'ARCHIVED' 
          ? 'Comunicado arquivado com sucesso!' 
          : 'Comunicado desarquivado com sucesso!'
      )
      loadAnnouncements()
    } catch (err) {
      console.error('Erro ao arquivar comunicado:', err)
      toast.error('Erro ao arquivar comunicado')
    }
  }

  // Verificar se pode criar comunicados
  const canCreate = () => {
    return user?.role === 'SECRETARIA' || user?.role === 'PROFESSOR'
  }

  const headerTitle = showStats
    ? 'Estatísticas do Comunicado'
    : showForm && canCreate()
      ? 'Novo Comunicado'
      : title

  usePageHeaderTitle(headerTitle)

  if (showForm && canCreate()) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-text-secondary">
            Envie informações importantes para a comunidade escolar
          </p>
        </div>

        <AnnouncementForm
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      </div>
    )
  }

  if (showStats) {
    return (
      <AnnouncementStats
        announcementId={showStats}
        onBack={() => setShowStats(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            Acompanhe os comunicados da escola
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnnouncements}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          {showCreateButton && canCreate() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-1" />
              Novo Comunicado
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Buscar comunicados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-neutral-500" />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ACTIVE">Ativos</SelectItem>
              <SelectItem value="ARCHIVED">Arquivados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os escopos</SelectItem>
              <SelectItem value="ALL_SCHOOL">Toda a Escola</SelectItem>
              <SelectItem value="TEACHERS">Professores</SelectItem>
              <SelectItem value="STUDENTS">Alunos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de comunicados */}
      {isLoading ? (
        <PageLoader label="Carregando comunicados..." />
      ) : error ? (
        <div className="space-y-4">
          <InlineError message={error} />
          <div className="flex justify-center">
            <Button variant="outline" onClick={loadAnnouncements}>
              <RefreshCw size={16} className="mr-1" />
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-neutral-500">{emptyMessage}</p>
            {announcements.length === 0 && canCreate() && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                <Plus size={16} className="mr-1" />
                Criar primeiro comunicado
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onMarkAsRead={handleMarkAsRead}
              onArchive={handleArchive}
              onViewStats={(id) => setShowStats(id)}
              showActions={canCreate()}
            />
          ))}
        </div>
      )}
    </div>
  )
}