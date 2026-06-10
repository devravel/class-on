import { apiClient } from '@/lib/api-client'
import {
  Teacher,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  CreateTeacherResponse,
} from '@/types/teacher'

export const teachersApi = {
  async list(): Promise<Teacher[]> {
    return apiClient.get<Teacher[]>('/teachers')
  },

  async getById(id: string): Promise<Teacher> {
    return apiClient.get<Teacher>(`/teachers/${id}`)
  },

  async create(data: CreateTeacherRequest): Promise<CreateTeacherResponse> {
    return apiClient.post<CreateTeacherResponse>('/teachers', data)
  },

  async update(id: string, data: UpdateTeacherRequest): Promise<Teacher> {
    return apiClient.patch<Teacher>(`/teachers/${id}`, data)
  },
}
