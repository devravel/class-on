import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator'

export class UpdateSubjectDto {
  @IsOptional()
  @IsString({ message: 'name deve ser uma string.' })
  @MinLength(2, { message: 'name deve ter no mínimo 2 caracteres.' })
  @MaxLength(255, { message: 'name deve ter no máximo 255 caracteres.' })
  name?: string

  @IsOptional()
  @IsString({ message: 'description deve ser uma string.' })
  @MinLength(1, { message: 'description é obrigatória.' })
  description?: string
}
