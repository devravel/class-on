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
import { StudentsService } from './students.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { CreateBulkStudentsDto } from './dto/create-bulk-students.dto'
import { EnrollStudentDto } from './dto/enroll-student.dto'

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('SECRETARIA')
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto)
  }

  @Post('bulk')
  @Roles('SECRETARIA')
  createBulk(@Body() dto: CreateBulkStudentsDto) {
    return this.studentsService.createBulk(dto)
  }

  @Post(':id/enroll')
  @Roles('SECRETARIA')
  enroll(@Param('id') id: string, @Body() dto: EnrollStudentDto) {
    return this.studentsService.enroll(BigInt(id), dto)
  }

  @Get()
  @Roles('SECRETARIA', 'PROFESSOR')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new ForbiddenException('Perfil de professor não encontrado.')
      }
      return this.studentsService.findByTeacherClasses(user.teacher.id)
    }

    return this.studentsService.findAll()
  }

  @Get(':id')
  @Roles('SECRETARIA')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(BigInt(id))
  }

  @Patch(':id')
  @Roles('SECRETARIA')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(BigInt(id), dto)
  }

  @Delete(':id/enrollments/:enrollmentId')
  @Roles('SECRETARIA')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEnrollment(
    @Param('id') id: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.studentsService.removeEnrollment(
      BigInt(id),
      BigInt(enrollmentId),
    )
  }
}
