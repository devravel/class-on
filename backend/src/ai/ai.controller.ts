import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { AiService } from './ai.service'
import { GenerateLessonPlanDto } from './dto/generate-lesson-plan.dto'
import { GenerateParentReportDto } from './dto/generate-parent-report.dto'

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-lesson-plan')
  @Roles('PROFESSOR', 'SECRETARIA')
  generateLessonPlan(@Body() dto: GenerateLessonPlanDto) {
    return this.aiService.generateLessonPlan(dto)
  }

  @Post('generate-parent-report')
  @Roles('SECRETARIA')
  generateParentReport(@Body() dto: GenerateParentReportDto) {
    return this.aiService.generateParentReport(dto)
  }
}
