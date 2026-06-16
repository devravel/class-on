import { apiClient } from '@/lib/api-client'
import {
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from '@/types/subject'

export const subjectsApi = {
  async list(): Promise<Subject[]> {
    return apiClient.get<Subject[]>('/subjects')
  },

  async getById(id: string): Promise<Subject> {
    return apiClient.get<Subject>(`/subjects/${id}`)
  },

  async create(data: CreateSubjectRequest): Promise<Subject> {
    return apiClient.post<Subject>('/subjects', data)
  },

  async update(id: string, data: UpdateSubjectRequest): Promise<Subject> {
    return apiClient.patch<Subject>(`/subjects/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/subjects/${id}`)
  },
}
