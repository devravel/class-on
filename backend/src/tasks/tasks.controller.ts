import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
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
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { SubmitTaskDto } from './dto/submit-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles('PROFESSOR')
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: AuthenticatedUser) {
    if (!user.teacher) {
      throw new ForbiddenException('Perfil de professor não encontrado.')
    }
    return this.tasksService.create(dto, user.teacher.id)
  }

  @Get()
  @Roles('PROFESSOR', 'SECRETARIA')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new ForbiddenException('Perfil de professor não encontrado.')
      }
      return this.tasksService.findByTeacher(user.teacher.id)
    }
    return this.tasksService.findAll()
  }

  @Get('student/me')
  @Roles('ALUNO')
  findMyTasks(@CurrentUser() user: AuthenticatedUser) {
    if (!user.student) {
      throw new ForbiddenException('Perfil de aluno não encontrado.')
    }
    return this.tasksService.findByStudent(user.student.id)
  }

  @Get(':id/submissions')
  @Roles('PROFESSOR')
  findSubmissions(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (!user.teacher) {
      throw new ForbiddenException('Perfil de professor não encontrado.')
    }
    return this.tasksService.findSubmissions(BigInt(id), user.teacher.id)
  }

  @Get(':id/student')
  @Roles('ALUNO')
  findOneForStudent(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (!user.student) {
      throw new ForbiddenException('Perfil de aluno não encontrado.')
    }
    return this.tasksService.findOneForStudent(BigInt(id), user.student.id)
  }

  @Post(':id/submit')
  @Roles('ALUNO')
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user.student) {
      throw new ForbiddenException('Perfil de aluno não encontrado.')
    }
    return this.tasksService.submit(BigInt(id), user.student.id, dto)
  }

  @Get(':id')
  @Roles('PROFESSOR', 'SECRETARIA')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const taskId = BigInt(id)

    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new ForbiddenException('Perfil de professor não encontrado.')
      }
      return this.tasksService.findOne(taskId, user.teacher.id)
    }
    return this.tasksService.findOne(taskId)
  }

  @Patch(':id')
  @Roles('PROFESSOR')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user.teacher) {
      throw new ForbiddenException('Perfil de professor não encontrado.')
    }
    return this.tasksService.update(BigInt(id), dto, user.teacher.id)
  }

  @Delete(':id')
  @Roles('PROFESSOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (!user.teacher) {
      throw new ForbiddenException('Perfil de professor não encontrado.')
    }
    return this.tasksService.remove(BigInt(id), user.teacher.id)
  }
}
