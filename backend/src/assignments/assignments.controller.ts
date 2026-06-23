import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy'
import { AssignmentsService } from './assignments.service'
import { CreateAssignmentDto } from './dto/create-assignment.dto'

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles('SECRETARIA')
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(dto)
  }

  @Get()
  @Roles('SECRETARIA')
  findAll() {
    return this.assignmentsService.findAll()
  }

  @Get('teacher/:teacherId')
  @Roles('SECRETARIA', 'PROFESSOR')
  findByTeacher(
    @Param('teacherId') teacherId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const id = BigInt(teacherId)

    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new ForbiddenException('Perfil de professor não encontrado.')
      }
      if (user.teacher.id !== id) {
        throw new ForbiddenException('Você só pode visualizar suas próprias atribuições.')
      }
    }

    return this.assignmentsService.findByTeacher(id)
  }

  @Get('class/:classId')
  @Roles('SECRETARIA')
  findByClass(@Param('classId') classId: string) {
    return this.assignmentsService.findByClass(BigInt(classId))
  }

  @Get(':id')
  @Roles('SECRETARIA', 'PROFESSOR')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const assignmentId = BigInt(id)

    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new ForbiddenException('Perfil de professor não encontrado.')
      }

      return this.assignmentsService.findOneForTeacher(assignmentId, user.teacher.id)
    }

    return this.assignmentsService.findOne(assignmentId)
  }

  @Delete(':id')
  @Roles('SECRETARIA')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(BigInt(id))
  }
}
