import { apiClient } from '@/lib/api-client'
import { Assignment, CreateAssignmentRequest } from '@/types/assignment'

export const assignmentsApi = {
  async list(): Promise<Assignment[]> {
    return apiClient.get<Assignment[]>('/assignments')
  },

  async getById(id: string): Promise<Assignment> {
    return apiClient.get<Assignment>(`/assignments/${id}`)
  },

  async getByTeacher(teacherId: string): Promise<Assignment[]> {
    return apiClient.get<Assignment[]>(`/assignments/teacher/${teacherId}`)
  },

  async getByClass(classId: string): Promise<Assignment[]> {
    return apiClient.get<Assignment[]>(`/assignments/class/${classId}`)
  },

  async create(data: CreateAssignmentRequest): Promise<Assignment> {
    return apiClient.post<Assignment>('/assignments', data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/assignments/${id}`)
  },
}
