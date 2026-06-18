import { apiClient } from '@/lib/api-client'
import { CreateLessonRequest, Lesson } from '@/types/lesson'

export const lessonsApi = {
  async create(data: CreateLessonRequest): Promise<Lesson> {
    return apiClient.post<Lesson>('/lessons', data)
  },

  async getByAssignment(assignmentId: string): Promise<Lesson[]> {
    return apiClient.get<Lesson[]>(`/lessons/assignment/${assignmentId}`)
  },

  async getById(id: string): Promise<Lesson> {
    return apiClient.get<Lesson>(`/lessons/${id}`)
  },
}
