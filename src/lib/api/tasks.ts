import { apiClient } from '@/lib/api-client'
import {
  CreateTaskRequest,
  StudentTask,
  SubmitTaskRequest,
  Task,
  TaskSubmissionResponse,
} from '@/types/task'

export const tasksApi = {
  async create(data: CreateTaskRequest): Promise<Task> {
    return apiClient.post<Task>('/tasks', data)
  },

  async list(): Promise<Task[]> {
    return apiClient.get<Task[]>('/tasks')
  },

  async listMyTasks(): Promise<StudentTask[]> {
    return apiClient.get<StudentTask[]>('/tasks/student/me')
  },

  async submit(taskId: string, data: SubmitTaskRequest): Promise<TaskSubmissionResponse> {
    return apiClient.post<TaskSubmissionResponse>(`/tasks/${taskId}/submit`, data)
  },
}
