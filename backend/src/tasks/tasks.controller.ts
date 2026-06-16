import {
  Body,
  Controller,
  Delete,
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
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { SubmitTaskDto } from './dto/submit-task.dto'

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // PROFESSOR ENDPOINTS
  @Post()
  @Roles('PROFESSOR')
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
    if (!user.teacher) {
      throw new Error('Perfil de professor não encontrado')
    }
    return this.tasksService.create(dto, user.teacher.id)
  }

  @Get()
  @Roles('PROFESSOR', 'SECRETARIA')
  findAll(@CurrentUser() user: any) {
    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new Error('Perfil de professor não encontrado')
      }
      return this.tasksService.findByTeacher(user.teacher.id)
    }
    // SECRETARIA vê todas as tarefas
    return this.tasksService.findAll()
  }

  @Get(':id')
  @Roles('PROFESSOR', 'SECRETARIA')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const taskId = BigInt(id)
    
    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new Error('Perfil de professor não encontrado')
      }
      return this.tasksService.findOne(taskId, user.teacher.id)
    }
    // SECRETARIA pode ver qualquer tarefa
    return this.tasksService.findOne(taskId)
  }

  @Get(':id/submissions')
  @Roles('PROFESSOR')
  findSubmissions(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user.teacher) {
      throw new Error('Perfil de professor não encontrado')
    }
    return this.tasksService.findSubmissions(BigInt(id), user.teacher.id)
  }

  @Delete(':id')
  @Roles('PROFESSOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user.teacher) {
      throw new Error('Perfil de professor não encontrado')
    }
    return this.tasksService.remove(BigInt(id), user.teacher.id)
  }

  // ALUNO ENDPOINTS
  @Get('student/me')
  @Roles('ALUNO')
  findMyTasks(@CurrentUser() user: any) {
    if (!user.student) {
      throw new Error('Perfil de aluno não encontrado')
    }
    return this.tasksService.findByStudent(user.student.id)
  }

  @Get(':id/student')
  @Roles('ALUNO')
  findOneForStudent(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user.student) {
      throw new Error('Perfil de aluno não encontrado')
    }
    return this.tasksService.findOneForStudent(BigInt(id), user.student.id)
  }

  @Post(':id/submit')
  @Roles('ALUNO')
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitTaskDto,
    @CurrentUser() user: any,
  ) {
    if (!user.student) {
      throw new Error('Perfil de aluno não encontrado')
    }
    return this.tasksService.submit(BigInt(id), user.student.id, dto)
  }
}