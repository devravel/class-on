import {
  Body,
  Controller,
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
import { AnnouncementsService } from './announcements.service'
import { CreateAnnouncementDto } from './dto/create-announcement.dto'
import { ArchiveAnnouncementDto } from './dto/archive-announcement.dto'

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @Roles('SECRETARIA', 'PROFESSOR')
  create(@Body() dto: CreateAnnouncementDto, @CurrentUser() user: any) {
    return this.announcementsService.create(dto, BigInt(user.id), user.role)
  }

  @Get()
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  findAll(@CurrentUser() user: any) {
    return this.announcementsService.findAll(BigInt(user.id), user.role)
  }

  @Get(':id')
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const announcementId = BigInt(id)
    return this.announcementsService.findOne(announcementId, BigInt(user.id), user.role)
  }

  @Post(':id/read')
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    const announcementId = BigInt(id)
    return this.announcementsService.markAsRead(announcementId, BigInt(user.id))
  }

  @Patch(':id/archive')
  @Roles('SECRETARIA', 'PROFESSOR')
  archive(
    @Param('id') id: string,
    @Body() dto: ArchiveAnnouncementDto,
    @CurrentUser() user: any,
  ) {
    const announcementId = BigInt(id)
    return this.announcementsService.archive(
      announcementId,
      dto,
      BigInt(user.id),
      user.role,
    )
  }

  @Get(':id/stats')
  @Roles('SECRETARIA', 'PROFESSOR')
  getStats(@Param('id') id: string, @CurrentUser() user: any) {
    const announcementId = BigInt(id)
    return this.announcementsService.getStats(announcementId, BigInt(user.id), user.role)
  }
}