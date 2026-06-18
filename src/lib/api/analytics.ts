import { apiClient } from '@/lib/api-client'
import { RiskAnalyticsResponse } from '@/types/analytics'

export const analyticsApi = {
  async getRiskAnalytics(): Promise<RiskAnalyticsResponse> {
    return apiClient.get<RiskAnalyticsResponse>('/dashboard/analytics/risk')
  },
}
