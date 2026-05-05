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
import { ClassesService } from './classes.service'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('SECRETARIA')
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto)
  }

  @Get()
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  findAll() {
    return this.classesService.findAll()
  }

  @Get(':id')
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(BigInt(id))
  }

  @Patch(':id')
  @Roles('SECRETARIA')
  update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classesService.update(BigInt(id), dto)
  }

  @Delete(':id')
  @Roles('SECRETARIA')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.classesService.remove(BigInt(id))
  }
}
