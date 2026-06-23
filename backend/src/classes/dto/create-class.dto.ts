import { IsEnum, IsInt, IsString, IsIn } from 'class-validator'
import { IsBigIntId } from '../../common/dto/is-bigint-id.decorator'

export enum Shift {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT',
}

export enum EducationLevel {
  FUNDAMENTAL = 'FUNDAMENTAL',
  MEDIO = 'MEDIO',
}

export class CreateClassDto {
  @IsBigIntId('year_id deve ser um número válido.')
  year_id: string

  @IsEnum(EducationLevel, {
    message: 'education_level deve ser FUNDAMENTAL ou MEDIO.',
  })
  education_level: EducationLevel

  @IsInt({ message: 'series deve ser um número inteiro.' })
  series: number

  @IsString({ message: 'letter deve ser uma string.' })
  @IsIn(['A', 'B', 'C', 'D', 'E'], {
    message: 'letter deve ser A, B, C, D ou E.',
  })
  letter: string

  @IsEnum(Shift, {
    message: 'shift deve ser MORNING, AFTERNOON ou NIGHT.',
  })
  shift: Shift
}
