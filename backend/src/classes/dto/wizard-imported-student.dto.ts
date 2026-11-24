import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

/** Aluno vindo da importação por arquivo, já revisado e aprovado na prévia. */
export class WizardImportedStudentDto {
  @IsString({ message: 'full_name deve ser uma string.' })
  @MinLength(2, { message: 'full_name deve ter no mínimo 2 caracteres.' })
  @MaxLength(255, { message: 'full_name deve ter no máximo 255 caracteres.' })
  full_name: string

  @IsString({ message: 'document deve ser uma string.' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d$/, {
    message: 'document deve estar no formato 000.000.000-0.',
  })
  document: string
}
