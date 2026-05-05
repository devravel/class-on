import { IsInt, IsISO8601, IsOptional, Min } from 'class-validator'

export class UpdateAcademicYearDto {
  @IsOptional()
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @Min(2000, { message: 'O ano deve ser a partir de 2000.' })
  year?: number

  @IsOptional()
  @IsISO8601({}, { message: 'start_date deve ser uma data válida no formato ISO 8601.' })
  start_date?: string

  @IsOptional()
  @IsISO8601({}, { message: 'end_date deve ser uma data válida no formato ISO 8601.' })
  end_date?: string
}
