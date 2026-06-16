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

  @Get(':id')
  @Roles('SECRETARIA', 'PROFESSOR')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(BigInt(id))
  }

  @Get('teacher/:teacherId')
  @Roles('SECRETARIA', 'PROFESSOR')
  findByTeacher(@Param('teacherId') teacherId: string, @CurrentUser() user: any) {
    const id = BigInt(teacherId)

    if (user.role === 'PROFESSOR') {
      if (!user.teacher || user.teacher.id !== id) {
        throw new Error('Você só pode visualizar suas próprias atribuições')
      }
    }

    return this.assignmentsService.findByTeacher(id)
  }

  @Get('class/:classId')
  @Roles('SECRETARIA')
  findByClass(@Param('classId') classId: string) {
    return this.assignmentsService.findByClass(BigInt(classId))
  }

  @Delete(':id')
  @Roles('SECRETARIA')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(BigInt(id))
  }
}
