import { apiClient } from '@/lib/api-client'
import { Bimester } from '@/types/bimester'

export const bimestersApi = {
  async getByYear(yearId: string): Promise<Bimester[]> {
    return apiClient.get<Bimester[]>(`/bimesters/year/${yearId}`)
  },
}
