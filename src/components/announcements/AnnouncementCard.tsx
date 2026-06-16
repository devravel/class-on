'use client'

import {
  Archive,
  Clock,
  Eye,
  School,
  Users,
  GraduationCap,
  BookOpen,
  User,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Announcement } from '@/types/announcement'
import { useAuth } from '@/contexts/auth-context'

const getRelativeTime = (date: Date) => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'agora'
  if (diffInMinutes < 60) return `há ${diffInMinutes} min`
  if (diffInHours < 24) return `há ${diffInHours}h`
  if (diffInDays === 1) return 'ontem'
  if (diffInDays < 7) return `há ${diffInDays} dias`
  return date.toLocaleDateString('pt-BR')
}

interface AnnouncementCardProps {
  announcement: Announcement
  onMarkAsRead?: (id: string) => void
  onArchive?: (id: string, status: 'ACTIVE' | 'ARCHIVED') => void
  onViewStats?: (id: string) => void
  showActions?: boolean
}

export function AnnouncementCard({
  announcement,
  onMarkAsRead,
  onArchive,
  onViewStats,
  showActions = true,
}: AnnouncementCardProps) {
  const { user } = useAuth()
  const [isRead, setIsRead] = useState(false)

  const getScopeIcon = () => {
    switch (announcement.scope_type) {
      case 'ALL_SCHOOL':
        return <School size={16} />
      case 'TEACHERS':
        return <GraduationCap size={16} />
      case 'STUDENTS':
        return <Users size={16} />
      default:
        return <School size={16} />
    }
  }

  const getScopeLabel = () => {
    switch (announcement.scope_type) {
      case 'ALL_SCHOOL':
        return 'Toda a Escola'
      case 'TEACHERS':
        return 'Professores'
      case 'STUDENTS':
        return 'Alunos'
      default:
        return 'Toda a Escola'
    }
  }

  const getTargetLabel = () => {
    if (announcement.target_type === 'ALL') {
      return getScopeLabel()
    }
    
    if (announcement.target_type === 'CLASS') {
      const classCount = announcement.announcements_targets.filter(t => t.class_id).length
      return `${classCount} turma${classCount > 1 ? 's' : ''}`
    }
    
    if (announcement.target_type === 'STUDENT') {
      const studentCount = announcement.announcements_targets.filter(t => t.student_id).length
      return `${studentCount} aluno${studentCount > 1 ? 's' : ''}`
    }
    
    return getScopeLabel()
  }

  const getTargetIcon = () => {
    if (announcement.target_type === 'CLASS') {
      return <BookOpen size={16} />
    }
    if (announcement.target_type === 'STUDENT') {
      return <User size={16} />
    }
    return getScopeIcon()
  }

  const canManage = () => {
    return (
      user?.role === 'SECRETARIA' || 
      announcement.creator_id === user?.id
    )
  }

  const handleMarkAsRead = () => {
    if (onMarkAsRead && !isRead) {
      onMarkAsRead(announcement.id)
      setIsRead(true)
    }
  }

  const handleArchive = () => {
    if (onArchive) {
      const newStatus = announcement.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE'
      onArchive(announcement.id, newStatus)
    }
  }

  const createdAt = new Date(announcement.created_at)
  const relativeTime = getRelativeTime(createdAt)

  return (
    <Card 
      className={`transition-all hover:shadow-md ${isRead ? 'opacity-75' : ''}`}
      onClick={handleMarkAsRead}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary mb-2">
              {announcement.title}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-1">
                {getScopeIcon()}
                <span>{getScopeLabel()}</span>
              </div>
              
              {announcement.target_type !== 'ALL' && (
                <div className="flex items-center gap-1">
                  {getTargetIcon()}
                  <span>{getTargetLabel()}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{relativeTime}</span>
              </div>
            </div>
          </div>

          {showActions && canManage() && (
            <div className="flex items-center gap-1">
              {onViewStats && (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Ver estatísticas"
                  onClick={(event) => {
                    event.stopPropagation()
                    onViewStats(announcement.id)
                  }}
                >
                  <Eye size={16} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                title={announcement.status === 'ACTIVE' ? 'Arquivar' : 'Desarquivar'}
                onClick={(event) => {
                  event.stopPropagation()
                  handleArchive()
                }}
              >
                <Archive size={16} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
          {announcement.message}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>Por: {announcement.users.teachers?.[0]?.full_name || announcement.users.email}</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={announcement.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {announcement.status === 'ACTIVE' ? 'Ativo' : 'Arquivado'}
            </Badge>
            
            {!isRead && user?.role !== 'SECRETARIA' && (
              <Badge variant="destructive" className="text-xs">
                Novo
              </Badge>
            )}
          </div>
        </div>

        {/* Mostrar lista de turmas/alunos se relevante */}
        {announcement.target_type === 'CLASS' && announcement.announcements_targets.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <p className="text-sm font-medium text-text-secondary mb-2">Turmas:</p>
            <div className="flex flex-wrap gap-1">
              {announcement.announcements_targets
                .filter(t => t.classes)
                .slice(0, 3)
                .map((target) => (
                  <Badge key={target.id} variant="outline" className="text-xs">
                    {target.classes?.name}
                  </Badge>
                ))}
              {announcement.announcements_targets.filter(t => t.classes).length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{announcement.announcements_targets.filter(t => t.classes).length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {announcement.target_type === 'STUDENT' && announcement.announcements_targets.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <p className="text-sm font-medium text-text-secondary mb-2">Alunos:</p>
            <div className="flex flex-wrap gap-1">
              {announcement.announcements_targets
                .filter(t => t.students)
                .slice(0, 2)
                .map((target) => (
                  <Badge key={target.id} variant="outline" className="text-xs">
                    {target.students?.full_name}
                  </Badge>
                ))}
              {announcement.announcements_targets.filter(t => t.students).length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{announcement.announcements_targets.filter(t => t.students).length - 2} mais
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}