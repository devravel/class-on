import { apiClient } from '@/lib/api-client'
import {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  CreateStudentResponse,
  CreateBulkStudentsRequest,
  CreateBulkStudentsResponse,
  EnrollStudentRequest,
  Enrollment,
} from '@/types/student'

export const studentsApi = {
  async list(): Promise<Student[]> {
    return apiClient.get<Student[]>('/students')
  },

  async getById(id: string): Promise<Student> {
    return apiClient.get<Student>(`/students/${id}`)
  },

  async create(data: CreateStudentRequest): Promise<CreateStudentResponse> {
    return apiClient.post<CreateStudentResponse>('/students', data)
  },

  async createBulk(
    data: CreateBulkStudentsRequest,
  ): Promise<CreateBulkStudentsResponse> {
    return apiClient.post<CreateBulkStudentsResponse>('/students/bulk', data)
  },

  async update(id: string, data: UpdateStudentRequest): Promise<Student> {
    return apiClient.patch<Student>(`/students/${id}`, data)
  },

  async enroll(id: string, data: EnrollStudentRequest): Promise<Enrollment> {
    return apiClient.post<Enrollment>(`/students/${id}/enroll`, data)
  },

  async removeEnrollment(
    studentId: string,
    enrollmentId: string,
  ): Promise<void> {
    return apiClient.delete(`/students/${studentId}/enrollments/${enrollmentId}`)
  },
}
