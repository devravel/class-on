'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, Users, Clock, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { announcementsApi } from '@/lib/api/announcements'
import { Announcement, AnnouncementStats as StatsType } from '@/types/announcement'

interface AnnouncementStatsProps {
  announcementId: string
  onBack: () => void
}

export function AnnouncementStats({ announcementId, onBack }: AnnouncementStatsProps) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [stats, setStats] = useState<StatsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [announcementData, statsData] = await Promise.all([
          announcementsApi.findOne(announcementId),
          announcementsApi.getStats(announcementId),
        ])
        setAnnouncement(announcementData)
        setStats(statsData)
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err)
        setError('Erro ao carregar estatísticas. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [announcementId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary" />
          <p className="mt-2 text-sm text-neutral-500">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  if (error || !announcement || !stats) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Voltar
        </Button>
        
        <div className="text-center py-12">
          <p className="text-neutral-500">{error || 'Estatísticas não encontradas.'}</p>
        </div>
      </div>
    )
  }

  const readPercentage = stats.totalRecipients > 0 
    ? Math.round((stats.readCount / stats.totalRecipients) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Voltar
        </Button>
        
        <div>
          <p className="text-sm text-text-secondary">Acompanhe o engajamento e alcance</p>
        </div>
      </div>

      {/* Informações do comunicado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{announcement.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={announcement.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {announcement.status === 'ACTIVE' ? 'Ativo' : 'Arquivado'}
            </Badge>
            <span className="text-sm text-text-secondary">
              Criado em {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary whitespace-pre-wrap">
            {announcement.message}
          </p>
        </CardContent>
      </Card>

      {/* Estatísticas principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Total de Destinatários</p>
                <p className="text-2xl font-bold">{stats.totalRecipients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Visualizações</p>
                <p className="text-2xl font-bold">{stats.readCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Não Lidos</p>
                <p className="text-2xl font-bold">{stats.unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Taxa de Leitura</p>
                <p className="text-2xl font-bold">{readPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progresso visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso de Leitura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Lidos: {stats.readCount}</span>
              <span>Não lidos: {stats.unreadCount}</span>
            </div>
            
            <div className="relative h-4 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-green-600 transition-all duration-300"
                style={{ width: `${readPercentage}%` }}
              />
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-green-600">{readPercentage}%</span>
              <span className="text-sm text-text-secondary ml-2">dos destinatários leram o comunicado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes dos destinatários */}
      {announcement.announcements_targets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Destinatários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcement.target_type === 'CLASS' && (
                <div>
                  <p className="font-medium text-text-secondary mb-2">Turmas:</p>
                  <div className="flex flex-wrap gap-2">
                    {announcement.announcements_targets
                      .filter(t => t.classes)
                      .map((target) => (
                        <Badge key={target.id} variant="outline">
                          {target.classes?.name} - {target.classes?.shift}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {announcement.target_type === 'STUDENT' && (
                <div>
                  <p className="font-medium text-text-secondary mb-2">Alunos:</p>
                  <div className="flex flex-wrap gap-2">
                    {announcement.announcements_targets
                      .filter(t => t.students)
                      .map((target) => (
                        <Badge key={target.id} variant="outline">
                          {target.students?.full_name} (RM: {target.students?.rm})
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {announcement.target_type === 'ALL' && (
                <div>
                  <Badge variant="outline" className="text-sm">
                    {announcement.scope_type === 'ALL_SCHOOL' && 'Toda a escola'}
                    {announcement.scope_type === 'TEACHERS' && 'Todos os professores'}
                    {announcement.scope_type === 'STUDENTS' && 'Todos os alunos'}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}