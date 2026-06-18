import { IsIn, IsInt, Max, Min } from 'class-validator'

export class CreateBimesterDto {
  @IsInt({ message: 'O número do bimestre deve ser um inteiro.' })
  @Min(1, { message: 'O número do bimestre deve ser no mínimo 1.' })
  @Max(4, { message: 'O número do bimestre deve ser no máximo 4.' })
  number: number

  @IsIn(['ABERTO', 'FECHADO'], { message: 'Status deve ser ABERTO ou FECHADO.' })
  status: string

  @IsInt({ message: 'year_id deve ser um número inteiro.' })
  @Min(1, { message: 'year_id deve ser um identificador válido.' })
  year_id: number
}
