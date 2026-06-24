import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

const USER_ROLES = ['SECRETARIA', 'PROFESSOR', 'ALUNO'] as const

export class CommandIntentDto {
  @IsString()
  @IsNotEmpty()
  input!: string

  @IsString()
  @IsIn(USER_ROLES)
  role!: (typeof USER_ROLES)[number]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableClasses?: string[]
}
