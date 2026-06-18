import { apiClient } from '@/lib/api-client'
import {
  AiGeneratedContent,
  GenerateLessonPlanPayload,
  GenerateParentReportPayload,
} from '@/types/ai'

export const aiApi = {
  async generateLessonPlan(
    payload: GenerateLessonPlanPayload,
  ): Promise<AiGeneratedContent> {
    return apiClient.post<AiGeneratedContent>(
      '/ai/generate-lesson-plan',
      payload,
    )
  },

  async generateParentReport(
    payload: GenerateParentReportPayload,
  ): Promise<AiGeneratedContent> {
    return apiClient.post<AiGeneratedContent>(
      '/ai/generate-parent-report',
      payload,
    )
  },
}
