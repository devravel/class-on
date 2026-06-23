import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy'
import { AnalyticsService } from './analytics.service'

@Controller('dashboard/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('risk')
  @Roles('SECRETARIA', 'PROFESSOR')
  getRiskAnalytics(@CurrentUser() user: AuthenticatedUser) {
    if (user.role === 'PROFESSOR') {
      if (!user.teacher) {
        throw new ForbiddenException('Perfil de professor não encontrado.')
      }

      return this.analyticsService.getRiskAnalytics(user.teacher.id)
    }

    return this.analyticsService.getRiskAnalytics()
  }
}
