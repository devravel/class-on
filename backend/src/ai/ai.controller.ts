import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy'
import { AiService } from './ai.service'
import { CommandIntentDto } from './dto/command-intent.dto'
import { GenerateLessonPlanDto } from './dto/generate-lesson-plan.dto'
import { GenerateParentReportDto } from './dto/generate-parent-report.dto'
import { GenerateTaskDto } from './dto/generate-task.dto'
import { GeneratedTaskResult } from './generate-task.types'

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('command-intent')
  @Roles('SECRETARIA', 'PROFESSOR', 'ALUNO')
  parseCommandIntent(
    @Body() dto: CommandIntentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.parseCommandIntent(dto, user.role)
  }

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

  @Post('generate-task')
  @Roles('PROFESSOR', 'SECRETARIA')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async generateTask(
    @Body() dto: GenerateTaskDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<GeneratedTaskResult> {
    const pdfText =
      file?.buffer && file.buffer.length > 0
        ? await this.aiService.extractPdfText(file.buffer)
        : undefined

    return this.aiService.generateTask({
      title: dto.title,
      schoolYear: dto.schoolYear,
      searchWeb: dto.searchWeb,
      links: dto.links,
      refinePrompt: dto.refinePrompt,
      historyText: dto.historyText,
      pdfText,
    })
  }
}
