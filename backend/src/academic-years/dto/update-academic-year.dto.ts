import { IsInt, IsIn, IsOptional, Min } from 'class-validator'

export class UpdateAcademicYearDto {
  @IsOptional()
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @Min(2000, { message: 'O ano deve ser a partir de 2000.' })
  year?: number

  @IsOptional()
  @IsIn(['ACTIVE', 'CLOSED'], { message: 'Status deve ser ACTIVE ou CLOSED.' })
  status?: string
}
