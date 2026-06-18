import { IsOptional, IsString, MinLength } from 'class-validator'

export class GenerateLessonPlanDto {
  @IsString({ message: 'A disciplina deve ser um texto.' })
  @MinLength(2, { message: 'Informe o nome da disciplina.' })
  subject: string

  @IsString({ message: 'A turma deve ser um texto.' })
  @MinLength(2, { message: 'Informe o nome ou ano da turma.' })
  class_name: string

  @IsOptional()
  @IsString()
  topic?: string
}
