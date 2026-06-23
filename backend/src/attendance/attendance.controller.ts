import {
  Body,
  Controller,
  ForbiddenException,
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
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy'
import {
  ParseBigIntPipe,
  ParseOptionalBigIntPipe,
} from '../common/pipes/parse-bigint.pipe'
import { AttendanceService } from './attendance.service'
import { MarkAttendanceDto } from './dto/mark-attendance.dto'

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('lessons/:lessonId/mark')
  @Roles('PROFESSOR')
  markAttendance(
    @Param('lessonId', ParseBigIntPipe) lessonId: bigint,
    @Body() dto: MarkAttendanceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user.teacher) {
      throw new ForbiddenException('Perfil de professor não encontrado.')
    }

    return this.attendanceService.markAttendance(lessonId, dto, user.teacher.id)
  }

  @Get('lessons/:lessonId')
  @Roles('PROFESSOR', 'SECRETARIA')
  findByLesson(
    @Param('lessonId', ParseBigIntPipe) lessonId: bigint,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new ForbiddenException('Perfil de professor não encontrado.')
      }

      return this.attendanceService.findByLesson(lessonId, user.teacher.id)
    }

    return this.attendanceService.findByLesson(lessonId)
  }

  @Get('classes/:classId/students-summary')
  @Roles('SECRETARIA', 'PROFESSOR')
  getClassStudentsAttendance(
    @Param('classId', ParseBigIntPipe) classId: bigint,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const teacherId =
      user.role === 'PROFESSOR'
        ? user.teacher?.id
        : undefined

    if (user.role === 'PROFESSOR' && !teacherId) {
      throw new ForbiddenException('Perfil de professor não encontrado.')
    }

    return this.attendanceService.getClassStudentsAttendance(classId, teacherId)
  }

  @Get('students/:studentId/summary')
  @Roles('PROFESSOR', 'SECRETARIA', 'ALUNO')
  getStudentSummary(
    @Param('studentId', ParseBigIntPipe) studentId: bigint,
    @Query('class_id', ParseOptionalBigIntPipe) classId: bigint | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.role === 'ALUNO') {
      if (!user.student || user.student.id !== studentId) {
        throw new ForbiddenException('Você só pode visualizar sua própria frequência.')
      }
    }

    let teacherId: bigint | undefined

    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new ForbiddenException('Perfil de professor não encontrado.')
      }

      teacherId = user.teacher.id
    }

    return this.attendanceService.getStudentSummary(studentId, teacherId, classId)
  }
}
