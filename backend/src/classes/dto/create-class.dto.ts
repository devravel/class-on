import { IsEnum, IsInt, IsString, IsIn } from 'class-validator'

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
  @IsInt({ message: 'year_id deve ser um número inteiro.' })
  year_id: number

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
