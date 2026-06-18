import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { TeachersService } from './teachers.service'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'
import { UpdateTeacherPasswordDto } from './dto/update-teacher-password.dto'

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles('SECRETARIA')
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto)
  }

  @Get()
  @Roles('SECRETARIA')
  findAll() {
    return this.teachersService.findAll()
  }

  @Get(':id')
  @Roles('SECRETARIA')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(BigInt(id))
  }

  @Patch(':id/password')
  @Roles('SECRETARIA')
  updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherPasswordDto,
  ) {
    return this.teachersService.updatePassword(BigInt(id), dto.password)
  }

  @Patch(':id')
  @Roles('SECRETARIA')
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(BigInt(id), dto)
  }
}
