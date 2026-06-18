import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class WizardManualStudentDto {
  @IsString({ message: 'full_name deve ser uma string.' })
  @MinLength(2, { message: 'full_name deve ter no mínimo 2 caracteres.' })
  @MaxLength(255, { message: 'full_name deve ter no máximo 255 caracteres.' })
  full_name: string

  @IsEmail({}, { message: 'email deve ser um endereço de e-mail válido.' })
  @MaxLength(255, { message: 'email deve ter no máximo 255 caracteres.' })
  email: string

  @IsString({ message: 'rm deve ser uma string.' })
  @MinLength(2, { message: 'rm deve ter no mínimo 2 caracteres.' })
  @MaxLength(255, { message: 'rm deve ter no máximo 255 caracteres.' })
  rm: string
}
