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

export class CreateEventDto {
  @IsString({ message: 'title deve ser uma string.' })
  @MinLength(5, { message: 'title deve ter no mínimo 5 caracteres.' })
  @MaxLength(255, { message: 'title deve ter no máximo 255 caracteres.' })
  title: string

  @IsString({ message: 'description deve ser uma string.' })
  @MinLength(10, { message: 'description deve ter no mínimo 10 caracteres.' })
  @MaxLength(5000, { message: 'description deve ter no máximo 5000 caracteres.' })
  description: string

  @IsDateString({}, { message: 'start_date deve ser uma data válida.' })
  start_date: string

  @IsDateString({}, { message: 'end_date deve ser uma data válida.' })
  end_date: string

  @IsBoolean({ message: 'all_day deve ser um boolean.' })
  all_day: boolean

  @IsString({ message: 'scope_type deve ser uma string.' })
  @IsIn(['ALL_SCHOOL', 'TEACHERS', 'STUDENTS', 'SPECIFIC_CLASSES'], {
    message: 'scope_type deve ser ALL_SCHOOL, TEACHERS, STUDENTS ou SPECIFIC_CLASSES.',
  })
  scope_type: string

  @IsOptional()
  @IsArray({ message: 'class_ids deve ser um array.' })
  @ArrayMinSize(1, { message: 'class_ids deve ter pelo menos 1 item.' })
  @ValidateIf((o) => o.scope_type === 'SPECIFIC_CLASSES')
  @Matches(/^\d+$/, { each: true, message: 'class_ids deve conter apenas números válidos.' })
  class_ids?: string[]
}