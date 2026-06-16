import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { LessonsService } from './lessons.service'
import { CreateLessonDto } from './dto/create-lesson.dto'

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles('PROFESSOR')
  create(@Body() dto: CreateLessonDto, @CurrentUser() user: any) {
    const teacherId = user.teacher.id
    return this.lessonsService.create(dto, teacherId)
  }

  @Get('assignment/:assignmentId')
  @Roles('PROFESSOR')
  findByAssignment(
    @Param('assignmentId') assignmentId: string,
    @CurrentUser() user: any,
  ) {
    const teacherId = user.teacher.id
    return this.lessonsService.findByAssignment(BigInt(assignmentId), teacherId)
  }

  @Get(':id')
  @Roles('PROFESSOR')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const teacherId = user.teacher.id
    return this.lessonsService.findOne(BigInt(id), teacherId)
  }
}