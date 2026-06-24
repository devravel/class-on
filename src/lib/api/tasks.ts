import { apiClient } from '@/lib/api-client'
import {
  CreateTaskRequest,
  StudentTask,
  SubmitTaskRequest,
  Task,
  TaskSubmissionResponse,
  TaskSubmissionsResponse,
  UpdateTaskRequest,
} from '@/types/task'

export const tasksApi = {
  async create(data: CreateTaskRequest): Promise<Task> {
    return apiClient.post<Task>('/tasks', data)
  },

  async list(): Promise<Task[]> {
    return apiClient.get<Task[]>('/tasks')
  },

  async getById(taskId: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${taskId}`)
  },

  async getSubmissions(taskId: string): Promise<TaskSubmissionsResponse> {
    return apiClient.get<TaskSubmissionsResponse>(`/tasks/${taskId}/submissions`)
  },

  async update(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${taskId}`, data)
  },

  async delete(taskId: string): Promise<void> {
    return apiClient.delete(`/tasks/${taskId}`)
  },

  async listMyTasks(): Promise<StudentTask[]> {
    return apiClient.get<StudentTask[]>('/tasks/student/me')
  },

  async submit(taskId: string, data: SubmitTaskRequest): Promise<TaskSubmissionResponse> {
    return apiClient.post<TaskSubmissionResponse>(`/tasks/${taskId}/submit`, data)
  },
}
