import { IsIn, IsInt, IsString, Matches, Max, Min } from 'class-validator'

export class CreateBimesterDto {
  @IsInt({ message: 'O número do bimestre deve ser um inteiro.' })
  @Min(1, { message: 'O número do bimestre deve ser no mínimo 1.' })
  @Max(4, { message: 'O número do bimestre deve ser no máximo 4.' })
  number: number

  @IsIn(['ABERTO', 'FECHADO'], { message: 'Status deve ser ABERTO ou FECHADO.' })
  status: string

  @IsString({ message: 'year_id deve ser uma string.' })
  @Matches(/^\d+$/, { message: 'year_id deve ser um identificador numérico válido.' })
  year_id: string
}
