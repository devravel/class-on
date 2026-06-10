import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateTeacherDto {
  @IsOptional()
  @IsString({ message: 'full_name deve ser uma string.' })
  @MinLength(2, { message: 'full_name deve ter no mínimo 2 caracteres.' })
  @MaxLength(255, { message: 'full_name deve ter no máximo 255 caracteres.' })
  full_name?: string

  @IsOptional()
  @IsEmail({}, { message: 'email deve ser um endereço de e-mail válido.' })
  @MaxLength(255, { message: 'email deve ter no máximo 255 caracteres.' })
  email?: string

  @IsOptional()
  @IsString({ message: 'registration_code deve ser uma string.' })
  @MinLength(2, { message: 'registration_code deve ter no mínimo 2 caracteres.' })
  @MaxLength(255, { message: 'registration_code deve ter no máximo 255 caracteres.' })
  registration_code?: string

  @IsOptional()
  @IsBoolean({ message: 'is_active deve ser um booleano.' })
  is_active?: boolean
}
