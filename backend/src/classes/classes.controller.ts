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
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { ClassWizardService } from './class-wizard.service'
import { ClassesService } from './classes.service'
import { CreateClassDto } from './dto/create-class.dto'
import { CreateClassWizardDto } from './dto/create-class-wizard.dto'
import { UpdateClassDto } from './dto/update-class.dto'

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly classWizardService: ClassWizardService,
  ) {}

  @Post()
  @Roles('SECRETARIA')
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto)
  }

  @Post('wizard')
  @Roles('SECRETARIA')
  createWizard(@Body() dto: CreateClassWizardDto) {
    return this.classWizardService.createWizard(dto)
  }

  @Get()
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  findAll(@Query('include_inactive') includeInactive?: string) {
    return this.classesService.findAll(includeInactive === 'true')
  }

  @Get(':id/details')
  @Roles('SECRETARIA', 'PROFESSOR')
  findOneDetails(@Param('id') id: string) {
    return this.classesService.findOneDetails(BigInt(id))
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
