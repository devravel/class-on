import { IsEnum, IsIn, IsInt, IsOptional, IsString } from 'class-validator'
import { EducationLevel, Shift } from './create-class.dto'
import { IsOptionalBigIntId } from '../../common/dto/is-bigint-id.decorator'

export class UpdateClassDto {
  @IsOptional()
  @IsOptionalBigIntId('year_id deve ser um número válido.')
  year_id?: string

  @IsOptional()
  @IsEnum(EducationLevel, {
    message: 'education_level deve ser FUNDAMENTAL ou MEDIO.',
  })
  education_level?: EducationLevel

  @IsOptional()
  @IsInt({ message: 'series deve ser um número inteiro.' })
  series?: number

  @IsOptional()
  @IsString({ message: 'letter deve ser uma string.' })
  @IsIn(['A', 'B', 'C', 'D', 'E'], { message: 'letter deve ser A, B, C, D ou E.' })
  letter?: string

  @IsOptional()
  @IsEnum(Shift, { message: 'shift deve ser MORNING, AFTERNOON ou NIGHT.' })
  shift?: Shift
}
