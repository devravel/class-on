import { apiClient } from '@/lib/api-client'
import { Class, CreateClassRequest, UpdateClassRequest } from '@/types/class'

export type { Class, CreateClassRequest, UpdateClassRequest }

export const classesApi = {
  async getAll(): Promise<Class[]> {
    return apiClient.get<Class[]>('/classes')
  },

  async list(): Promise<Class[]> {
    return apiClient.get<Class[]>('/classes')
  },

  async getById(id: string): Promise<Class> {
    return apiClient.get<Class>(`/classes/${id}`)
  },

  async create(data: CreateClassRequest): Promise<Class> {
    return apiClient.post<Class>('/classes', data)
  },

  async update(id: string, data: UpdateClassRequest): Promise<Class> {
    return apiClient.patch<Class>(`/classes/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/classes/${id}`)
  },
}
