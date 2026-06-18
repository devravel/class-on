import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

export class GenerateParentReportDto {
  @IsString({ message: 'O nome do aluno deve ser um texto.' })
  @MinLength(2, { message: 'Informe o nome do aluno.' })
  student_name: string

  @IsOptional()
  @IsNumber({}, { message: 'A média de notas deve ser numérica.' })
  grade_average?: number

  @IsOptional()
  @IsNumber({}, { message: 'A frequência deve ser numérica.' })
  attendance_rate?: number

  @IsOptional()
  @IsNumber({}, { message: 'O score de risco deve ser numérico.' })
  risk_score?: number
}
