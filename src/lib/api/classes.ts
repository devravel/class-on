import { apiClient } from '@/lib/api-client'
import {
  Class,
  ClassDetails,
  ClassWizardResponse,
  CreateClassRequest,
  CreateClassWizardRequest,
  UpdateClassRequest,
} from '@/types/class'

export type { Class, ClassDetails, CreateClassRequest, UpdateClassRequest, CreateClassWizardRequest, ClassWizardResponse }

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

  async getDetails(id: string): Promise<ClassDetails> {
    return apiClient.get<ClassDetails>(`/classes/${id}/details`)
  },

  async create(data: CreateClassRequest): Promise<Class> {
    return apiClient.post<Class>('/classes', data)
  },

  async createWizard(data: CreateClassWizardRequest): Promise<ClassWizardResponse> {
    return apiClient.post<ClassWizardResponse>('/classes/wizard', data)
  },

  async update(id: string, data: UpdateClassRequest): Promise<Class> {
    return apiClient.patch<Class>(`/classes/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/classes/${id}`)
  },
}
