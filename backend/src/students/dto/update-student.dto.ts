import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateStudentDto {
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
  @IsString({ message: 'rm deve ser uma string.' })
  @MinLength(2, { message: 'rm deve ter no mínimo 2 caracteres.' })
  @MaxLength(255, { message: 'rm deve ter no máximo 255 caracteres.' })
  rm?: string

  @IsOptional()
  @IsString({ message: 'status deve ser uma string.' })
  @IsIn(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED'], {
    message: 'status deve ser ACTIVE, INACTIVE, TRANSFERRED ou GRADUATED.',
  })
  status?: string

  @IsOptional()
  @IsBoolean({ message: 'is_active deve ser um booleano.' })
  is_active?: boolean
}
