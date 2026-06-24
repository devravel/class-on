import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class UpdateTaskDto {
  @IsOptional()
  @IsString({ message: 'title deve ser uma string.' })
  @MinLength(5, { message: 'title deve ter no mínimo 5 caracteres.' })
  @MaxLength(255, { message: 'title deve ter no máximo 255 caracteres.' })
  title?: string

  @IsOptional()
  @IsString({ message: 'description deve ser uma string.' })
  @MinLength(10, { message: 'description deve ter no mínimo 10 caracteres.' })
  @MaxLength(5000, {
    message: 'description deve ter no máximo 5000 caracteres.',
  })
  description?: string

  @IsOptional()
  @IsDateString({}, { message: 'deadline deve ser uma data válida.' })
  deadline?: string

  @IsOptional()
  @IsString({ message: 'status deve ser uma string.' })
  @IsIn(['OPEN', 'CLOSED'], {
    message: 'status deve ser OPEN ou CLOSED.',
  })
  status?: string
}
