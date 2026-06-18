import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AttendanceService } from './attendance.service'
import { MarkAttendanceDto } from './dto/mark-attendance.dto'

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('lessons/:lessonId/mark')
  @Roles('PROFESSOR')
  markAttendance(
    @Param('lessonId') lessonId: string,
    @Body() dto: MarkAttendanceDto,
    @CurrentUser() user: any,
  ) {
    const teacherId = user.teacher.id
    return this.attendanceService.markAttendance(BigInt(lessonId), dto, teacherId)
  }

  @Get('lessons/:lessonId')
  @Roles('PROFESSOR', 'SECRETARIA')
  findByLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any,
  ) {
    const teacherId = user.role === 'PROFESSOR' ? user.teacher.id : undefined
    return this.attendanceService.findByLesson(BigInt(lessonId), teacherId)
  }

  @Get('classes/:classId/students-summary')
  @Roles('SECRETARIA', 'PROFESSOR')
  getClassStudentsAttendance(@Param('classId') classId: string) {
    return this.attendanceService.getClassStudentsAttendance(BigInt(classId))
  }

  @Get('students/:studentId/summary')
  @Roles('PROFESSOR', 'SECRETARIA', 'ALUNO')
  getStudentSummary(
    @Param('studentId') studentId: string,
    @Query('class_id') classId: string | undefined,
    @CurrentUser() user: any,
  ) {
    const id = BigInt(studentId)

    if (user.role === 'ALUNO') {
      if (!user.student || user.student.id !== id) {
        throw new Error('Você só pode visualizar sua própria frequência')
      }
    }

    const teacherId = user.role === 'PROFESSOR' ? user.teacher.id : undefined
    const classIdBigInt = classId ? BigInt(classId) : undefined
    return this.attendanceService.getStudentSummary(id, teacherId, classIdBigInt)
  }
}