import { apiClient } from '@/lib/api-client'
import { AuthMeResponse } from '@/types/auth'

export const authApi = {
  async getMe(): Promise<AuthMeResponse> {
    return apiClient.get<AuthMeResponse>('/auth/me')
  },
}
