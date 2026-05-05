import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Shift } from './create-class.dto'

export class UpdateClassDto {
  @IsOptional()
  @IsInt({ message: 'year_id deve ser um número inteiro.' })
  year_id?: number

  @IsOptional()
  @IsInt({ message: 'series deve ser um número inteiro.' })
  @Min(1, { message: 'series deve ser 1, 2 ou 3.' })
  @Max(3, { message: 'series deve ser 1, 2 ou 3.' })
  series?: number

  @IsOptional()
  @IsString({ message: 'letter deve ser uma string.' })
  @IsIn(['A', 'B', 'C', 'D', 'E'], { message: 'letter deve ser A, B, C, D ou E.' })
  letter?: string

  @IsOptional()
  @IsEnum(Shift, { message: 'shift deve ser MORNING, AFTERNOON ou NIGHT.' })
  shift?: Shift
}
