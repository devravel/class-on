import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy'
import { GradesService } from './grades.service'
import { CreateGradeDto } from './dto/create-grade.dto'
import { AddRecoveryDto } from './dto/add-recovery.dto'

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @Roles('PROFESSOR')
  create(@Body() dto: CreateGradeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.gradesService.create(dto, BigInt(user.id))
  }

  @Get('assignment/:assignmentId/bimester/:bimesterId')
  @Roles('PROFESSOR', 'SECRETARIA')
  findByAssignmentAndBimester(
    @Param('assignmentId') assignmentId: string,
    @Param('bimesterId') bimesterId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = user.role === 'PROFESSOR' ? BigInt(user.id) : undefined
    return this.gradesService.findByAssignmentAndBimester(
      BigInt(assignmentId),
      BigInt(bimesterId),
      userId,
    )
  }

  @Patch(':id/recovery')
  @Roles('PROFESSOR')
  addRecovery(
    @Param('id') id: string,
    @Body() dto: AddRecoveryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.gradesService.addRecovery(BigInt(id), dto, BigInt(user.id))
  }

  @Get('my-grades')
  @Roles('ALUNO')
  findMyGrades(@CurrentUser() user: AuthenticatedUser) {
    return this.gradesService.findMyGrades(BigInt(user.id))
  }

  @Get('student/:studentId')
  @Roles('SECRETARIA', 'PROFESSOR')
  findByStudent(
    @Param('studentId') studentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new ForbiddenException('Perfil de professor não encontrado.')
      }

      return this.gradesService.findByStudentForTeacher(
        BigInt(studentId),
        user.teacher.id,
      )
    }

    return this.gradesService.findByStudent(BigInt(studentId))
  }
}