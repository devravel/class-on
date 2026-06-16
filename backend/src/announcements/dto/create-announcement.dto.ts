import {
  IsString,
  IsArray,
  IsOptional,
  IsIn,
  MaxLength,
  MinLength,
  Matches,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator'

export class CreateAnnouncementDto {
  @IsString({ message: 'title deve ser uma string.' })
  @MinLength(5, { message: 'title deve ter no mínimo 5 caracteres.' })
  @MaxLength(255, { message: 'title deve ter no máximo 255 caracteres.' })
  title: string

  @IsString({ message: 'message deve ser uma string.' })
  @MinLength(10, { message: 'message deve ter no mínimo 10 caracteres.' })
  @MaxLength(5000, { message: 'message deve ter no máximo 5000 caracteres.' })
  message: string

  @IsString({ message: 'scope_type deve ser uma string.' })
  @IsIn(['ALL_SCHOOL', 'TEACHERS', 'STUDENTS'], {
    message: 'scope_type deve ser ALL_SCHOOL, TEACHERS ou STUDENTS.',
  })
  scope_type: string

  @IsString({ message: 'target_type deve ser uma string.' })
  @IsIn(['ALL', 'CLASS', 'STUDENT'], {
    message: 'target_type deve ser ALL, CLASS ou STUDENT.',
  })
  target_type: string

  @IsOptional()
  @IsArray({ message: 'class_ids deve ser um array.' })
  @ArrayMinSize(1, { message: 'class_ids deve ter pelo menos 1 item.' })
  @ValidateIf((o) => o.target_type === 'CLASS')
  @Matches(/^\d+$/, { each: true, message: 'class_ids deve conter apenas números válidos.' })
  class_ids?: string[]

  @IsOptional()
  @IsArray({ message: 'student_ids deve ser um array.' })
  @ArrayMinSize(1, { message: 'student_ids deve ter pelo menos 1 item.' })
  @ValidateIf((o) => o.target_type === 'STUDENT')
  @Matches(/^\d+$/, { each: true, message: 'student_ids deve conter apenas números válidos.' })
  student_ids?: string[]
}