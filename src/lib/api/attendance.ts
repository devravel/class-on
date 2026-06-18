import { apiClient } from '@/lib/api-client'
import {
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

  async getStudentSummary(studentId: string): Promise<StudentAttendanceSummary> {
    return apiClient.get<StudentAttendanceSummary>(
      `/attendance/students/${studentId}/summary`,
    )
  },
}
