import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { AnalyticsService } from './analytics.service'

@Controller('dashboard/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('risk')
  @Roles('SECRETARIA', 'PROFESSOR')
  getRiskAnalytics() {
    return this.analyticsService.getRiskAnalytics()
  }
}
