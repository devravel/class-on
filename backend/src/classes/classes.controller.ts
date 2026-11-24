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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
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

  /** Lê a lista de alunos do arquivo e devolve a prévia. Não grava nada. */
  @Post('wizard/import-preview')
  @Roles('SECRETARIA')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  previewImport(@UploadedFile() file?: Express.Multer.File) {
    return this.classWizardService.previewImport(file)
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

  @Delete(':id/permanent')
  @Roles('SECRETARIA')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentRemove(@Param('id') id: string) {
    return this.classesService.permanentRemove(BigInt(id))
  }

  @Delete(':id')
  @Roles('SECRETARIA')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.classesService.remove(BigInt(id))
  }
}
