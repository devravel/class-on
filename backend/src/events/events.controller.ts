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
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { EventsService } from './events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('SECRETARIA', 'PROFESSOR')
  create(@Body() dto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.create(dto, BigInt(user.id), user.role)
  }

  @Get()
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  findAll(@CurrentUser() user: any) {
    return this.eventsService.findAll(BigInt(user.id), user.role)
  }

  @Get('calendar')
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  getCalendar(@CurrentUser() user: any, @Query('classId') classId?: string) {
    return this.eventsService.getCalendar(BigInt(user.id), user.role, classId)
  }

  @Get(':id')
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const eventId = BigInt(id)
    return this.eventsService.findOne(eventId, BigInt(user.id), user.role)
  }

  @Patch(':id')
  @Roles('SECRETARIA', 'PROFESSOR')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: any,
  ) {
    const eventId = BigInt(id)
    return this.eventsService.update(eventId, dto, BigInt(user.id), user.role)
  }

  @Delete(':id')
  @Roles('SECRETARIA', 'PROFESSOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const eventId = BigInt(id)
    return this.eventsService.remove(eventId, BigInt(user.id), user.role)
  }
}