import { apiClient } from '../api-client'

export interface Event {
  id: string
  creator_id: string
  year_id: string
  title: string
  description: string
  start_date: string
  end_date: string
  all_day: boolean
  status: 'ACTIVE' | 'CANCELLED'
  scope_type: 'ALL_SCHOOL' | 'TEACHERS' | 'STUDENTS' | 'SPECIFIC_CLASSES'
  created_at: string
  updated_at: string
  users: {
    id: string
    email: string
    role: string
    teachers?: Array<{
      id: string
      full_name: string
    }>
  }
  academic_years: {
    id: string
    year: number
  }
  event_targets: Array<{
    id: string
    event_id: string
    class_id: string
    classes: {
      id: string
      education_level: 'FUNDAMENTAL' | 'MEDIO'
      series: number
      letter: string
      shift: string
      academic_years: {
        id: string
        year: number
      }
    }
  }>
}

export interface CreateEventDto {
  title: string
  description: string
  start_date: string
  end_date: string
  all_day: boolean
  scope_type: 'ALL_SCHOOL' | 'TEACHERS' | 'STUDENTS' | 'SPECIFIC_CLASSES'
  class_ids?: string[]
}

export interface UpdateEventDto {
  title?: string
  description?: string
  start_date?: string
  end_date?: string
  all_day?: boolean
  status?: 'ACTIVE' | 'CANCELLED'
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  extendedProps: {
    description: string
    creator: string
    creator_id: string
    status: string
    scope_type: string
  }
}

class EventsApi {
  /**
   * Criar um novo evento
   */
  async create(data: CreateEventDto): Promise<Event> {
    return apiClient.post<Event>('/events', data)
  }

  /**
   * Listar todos os eventos do usuário
   */
  async getAll(): Promise<Event[]> {
    return apiClient.get<Event[]>('/events')
  }

  /**
   * Buscar evento por ID
   */
  async getById(id: string): Promise<Event> {
    return apiClient.get<Event>(`/events/${id}`)
  }

  /**
   * Atualizar evento
   */
  async update(id: string, data: UpdateEventDto): Promise<Event> {
    return apiClient.patch<Event>(`/events/${id}`, data)
  }

  /**
   * Deletar evento
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/events/${id}`)
  }

  /**
   * Buscar eventos no formato FullCalendar
   */
  async getCalendar(classId?: string): Promise<CalendarEvent[]> {
    const params = classId ? `?classId=${classId}` : ''
    return apiClient.get<CalendarEvent[]>(`/events/calendar${params}`)
  }
}

export const eventsApi = new EventsApi()