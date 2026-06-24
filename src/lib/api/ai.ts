import { apiClient } from '@/lib/api-client'
import type { CommandIntentResponse } from '@/lib/command-intent'
import {
  AiGeneratedContent,
  CommandIntentPayload,
  GenerateLessonPlanPayload,
  GenerateParentReportPayload,
  GenerateTaskPayload,
  GenerateTaskResponse,
} from '@/types/ai'

export const aiApi = {
  async parseCommandIntent(
    payload: CommandIntentPayload,
  ): Promise<CommandIntentResponse> {
    return apiClient.post<CommandIntentResponse>('/ai/command-intent', payload)
  },

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

  async generateTask(
    payload: GenerateTaskPayload,
  ): Promise<GenerateTaskResponse> {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('schoolYear', payload.schoolYear)
    formData.append('searchWeb', String(payload.searchWeb))
    formData.append('links', JSON.stringify(payload.links ?? []))

    if (payload.refinePrompt) {
      formData.append('refinePrompt', payload.refinePrompt)
    }
    if (payload.historyText) {
      formData.append('historyText', payload.historyText)
    }
    if (payload.file) {
      formData.append('file', payload.file, payload.file.name)
    }

    return apiClient.postForm<GenerateTaskResponse>(
      '/ai/generate-task',
      formData,
    )
  },
}
