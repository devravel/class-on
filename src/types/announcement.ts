export interface Announcement {
  id: string
  creator_id: string
  title: string
  message: string
  status: 'ACTIVE' | 'ARCHIVED'
  scope_type: 'ALL_SCHOOL' | 'TEACHERS' | 'STUDENTS'
  target_type: 'ALL' | 'CLASS' | 'STUDENT'
  created_at: string
  users: {
    id: string
    email: string
    role: string
    teachers?: {
      id: string
      full_name: string
    }[]
  }
  announcements_targets: AnnouncementTarget[]
  _count: {
    announcement_reads: number
  }
}

export interface AnnouncementTarget {
  id: string
  announcement_id: string
  class_id?: string
  student_id?: string
  classes?: {
    id: string
    name: string
    shift: string
    academic_years: {
      id: string
      year: number
    }
  }
  students?: {
    id: string
    full_name: string
    rm: string
  }
}

export interface CreateAnnouncementDto {
  title: string
  message: string
  scope_type: 'ALL_SCHOOL' | 'TEACHERS' | 'STUDENTS'
  target_type: 'ALL' | 'CLASS' | 'STUDENT'
  class_ids?: string[]
  student_ids?: string[]
}

export interface ArchiveAnnouncementDto {
  status: 'ACTIVE' | 'ARCHIVED'
}

export interface AnnouncementStats {
  totalRecipients: number
  readCount: number
  unreadCount: number
}

export interface AnnouncementRead {
  id: string
  announcement_id: string
  user_id: string
  read_at: string
}