import { apiClient } from '@/lib/api-client'
import { 
  Announcement, 
  CreateAnnouncementDto, 
  ArchiveAnnouncementDto, 
  AnnouncementStats 
} from '@/types/announcement'

export const announcementsApi = {
  findAll: (): Promise<Announcement[]> => {
    return apiClient.get<Announcement[]>('/announcements')
  },

  findOne: (id: string): Promise<Announcement> => {
    return apiClient.get<Announcement>(`/announcements/${id}`)
  },

  create: (dto: CreateAnnouncementDto): Promise<Announcement> => {
    return apiClient.post<Announcement>('/announcements', dto)
  },

  markAsRead: (id: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(`/announcements/${id}/read`)
  },

  archive: (id: string, dto: ArchiveAnnouncementDto): Promise<Announcement> => {
    return apiClient.patch<Announcement>(`/announcements/${id}/archive`, dto)
  },

  getStats: (id: string): Promise<AnnouncementStats> => {
    return apiClient.get<AnnouncementStats>(`/announcements/${id}/stats`)
  },
}