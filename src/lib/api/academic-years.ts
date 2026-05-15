import { apiClient } from '@/lib/api-client'
import { AcademicYear } from '@/types/academic-year'

export interface CreateAcademicYearDto {
  year: number
  status?: 'ACTIVE' | 'CLOSED'
}

export interface UpdateAcademicYearDto {
  year?: number
  status?: 'ACTIVE' | 'CLOSED'
}

/**
 * API de Anos Letivos
 */
export const academicYearsApi = {
  /**
   * Lista todos os anos letivos
   */
  async list(): Promise<AcademicYear[]> {
    return apiClient.get<AcademicYear[]>('/academic-years')
  },

  /**
   * Busca o ano letivo ativo
   */
  async getActive(): Promise<AcademicYear> {
    return apiClient.get<AcademicYear>('/academic-years/active')
  },

  /**
   * Busca um ano letivo por ID
   */
  async getById(id: string): Promise<AcademicYear> {
    return apiClient.get<AcademicYear>(`/academic-years/${id}`)
  },

  /**
   * Cria um novo ano letivo
   */
  async create(data: CreateAcademicYearDto): Promise<AcademicYear> {
    return apiClient.post<AcademicYear>('/academic-years', data)
  },

  /**
   * Atualiza um ano letivo
   */
  async update(id: string, data: UpdateAcademicYearDto): Promise<AcademicYear> {
    return apiClient.patch<AcademicYear>(`/academic-years/${id}`, data)
  },

  /**
   * Encerra um ano letivo
   */
  async close(id: string): Promise<AcademicYear> {
    return apiClient.patch<AcademicYear>(`/academic-years/${id}/close`)
  },

  /**
   * Deleta um ano letivo
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/academic-years/${id}`)
  },
}
