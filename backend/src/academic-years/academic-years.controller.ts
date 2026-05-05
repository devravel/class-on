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
import { AcademicYearsService } from './academic-years.service'
import { CreateAcademicYearDto } from './dto/create-academic-year.dto'
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto'

@Controller('academic-years')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Post()
  @Roles('SECRETARIA')
  create(@Body() dto: CreateAcademicYearDto) {
    return this.academicYearsService.create(dto)
  }

  @Get()
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  findAll() {
    return this.academicYearsService.findAll()
  }

  @Get(':id')
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  findOne(@Param('id') id: string) {
    return this.academicYearsService.findOne(BigInt(id))
  }

  @Patch(':id')
  @Roles('SECRETARIA')
  update(@Param('id') id: string, @Body() dto: UpdateAcademicYearDto) {
    return this.academicYearsService.update(BigInt(id), dto)
  }

  @Delete(':id')
  @Roles('SECRETARIA')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.academicYearsService.remove(BigInt(id))
  }
}
