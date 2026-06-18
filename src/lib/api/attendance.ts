import { apiClient } from '@/lib/api-client'
import {
  ClassStudentAttendanceSummary,
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  StudentAttendanceSummary,
} from '@/types/attendance'

export const attendanceApi = {
  async markAttendance(
    lessonId: string,
    data: MarkAttendanceRequest,
  ): Promise<MarkAttendanceResponse> {
    return apiClient.post<MarkAttendanceResponse>(
      `/attendance/lessons/${lessonId}/mark`,
      data,
    )
  },

  async getStudentSummary(
    studentId: string,
    classId?: string,
  ): Promise<StudentAttendanceSummary> {
    const query = classId ? `?class_id=${classId}` : ''
    return apiClient.get<StudentAttendanceSummary>(
      `/attendance/students/${studentId}/summary${query}`,
    )
  },

  async getClassStudentsSummary(
    classId: string,
  ): Promise<ClassStudentAttendanceSummary[]> {
    return apiClient.get<ClassStudentAttendanceSummary[]>(
      `/attendance/classes/${classId}/students-summary`,
    )
  },
}
