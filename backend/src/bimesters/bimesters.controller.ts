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
import { BimestersService } from './bimesters.service'
import { CreateBimesterDto } from './dto/create-bimester.dto'
import { UpdateBimesterStatusDto } from './dto/update-bimester-status.dto'

@Controller('bimesters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BimestersController {
  constructor(private readonly bimestersService: BimestersService) {}

  @Post()
  @Roles('SECRETARIA')
  create(@Body() dto: CreateBimesterDto) {
    return this.bimestersService.create(dto)
  }

  @Get('year/:yearId')
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  findByYear(@Param('yearId') yearId: string) {
    return this.bimestersService.findByYear(BigInt(yearId))
  }

  @Patch(':id')
  @Roles('SECRETARIA')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBimesterStatusDto,
  ) {
    return this.bimestersService.updateStatus(BigInt(id), dto)
  }
}
