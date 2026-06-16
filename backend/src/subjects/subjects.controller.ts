import {
  Body,
  Controller,
  Delete,
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
import { SubjectsService } from './subjects.service'
import { CreateSubjectDto } from './dto/create-subject.dto'
import { UpdateSubjectDto } from './dto/update-subject.dto'

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles('SECRETARIA')
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto)
  }

  @Get()
  @Roles('SECRETARIA', 'PROFESSOR')
  findAll() {
    return this.subjectsService.findAll()
  }

  @Get(':id')
  @Roles('SECRETARIA', 'PROFESSOR')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(BigInt(id))
  }

  @Patch(':id')
  @Roles('SECRETARIA')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(BigInt(id), dto)
  }

  @Delete(':id')
  @Roles('SECRETARIA')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(BigInt(id))
  }
}
