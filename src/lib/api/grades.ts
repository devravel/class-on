import { apiClient } from '@/lib/api-client'
import {
  AddRecoveryRequest,
  CreateGradeRequest,
  GradeRecord,
  GradeRow,
  StudentGradeRecord,
} from '@/types/grade'

export const gradesApi = {
  async create(data: CreateGradeRequest): Promise<GradeRecord> {
    return apiClient.post<GradeRecord>('/grades', data)
  },

  async getByAssignmentAndBimester(
    assignmentId: string,
    bimesterId: string,
  ): Promise<GradeRow[]> {
    return apiClient.get<GradeRow[]>(
      `/grades/assignment/${assignmentId}/bimester/${bimesterId}`,
    )
  },

  async addRecovery(
    gradeId: string,
    data: AddRecoveryRequest,
  ): Promise<GradeRecord> {
    return apiClient.patch<GradeRecord>(`/grades/${gradeId}/recovery`, data)
  },

  async getMyGrades(): Promise<StudentGradeRecord[]> {
    return apiClient.get<StudentGradeRecord[]>('/grades/my-grades')
  },
}
