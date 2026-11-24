import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy'
import { ConversationsService } from './conversations.service'
import { SendMessageDto } from './dto/send-message.dto'

/**
 * Conversas aluno ↔ professor. `:id` é sempre "a outra pessoa": o professor
 * (teacher.id) quando quem chama é aluno, o aluno (student.id) quando é professor.
 */
@Controller('conversations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ALUNO', 'PROFESSOR')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get('contacts')
  contacts(@CurrentUser() user: AuthenticatedUser, @Query('q') query?: string) {
    return this.conversationsService.contacts(user, query)
  }

  @Get('with/:id')
  thread(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.conversationsService.thread(user, id)
  }

  @Post('with/:id/messages')
  send(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.conversationsService.send(user, id, dto.content)
  }

  @Post('with/:id/draft')
  draft(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.conversationsService.draft(user, id)
  }
}
