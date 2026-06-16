import {
  IsString,
  IsArray,
  IsOptional,
  IsIn,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
  ArrayMinSize,
  ValidateIf,
  Matches,
} from 'class-validator'

export class UpdateEventDto {
  @IsOptional()
  @IsString({ message: 'title deve ser uma string.' })
  @MinLength(5, { message: 'title deve ter no mínimo 5 caracteres.' })
  @MaxLength(255, { message: 'title deve ter no máximo 255 caracteres.' })
  title?: string

  @IsOptional()
  @IsString({ message: 'description deve ser uma string.' })
  @MinLength(10, { message: 'description deve ter no mínimo 10 caracteres.' })
  @MaxLength(5000, { message: 'description deve ter no máximo 5000 caracteres.' })
  description?: string

  @IsOptional()
  @IsDateString({}, { message: 'start_date deve ser uma data válida.' })
  start_date?: string

  @IsOptional()
  @IsDateString({}, { message: 'end_date deve ser uma data válida.' })
  end_date?: string

  @IsOptional()
  @IsBoolean({ message: 'all_day deve ser um boolean.' })
  all_day?: boolean

  @IsOptional()
  @IsString({ message: 'status deve ser uma string.' })
  @IsIn(['ACTIVE', 'CANCELLED'], {
    message: 'status deve ser ACTIVE ou CANCELLED.',
  })
  status?: string
}