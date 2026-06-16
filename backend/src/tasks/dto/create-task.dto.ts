import {
  IsDateString,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateTaskDto {
  @IsString({ message: 'assignment_id deve ser uma string.' })
  @Matches(/^\d+$/, { message: 'assignment_id deve ser um número válido.' })
  assignment_id: string

  @IsString({ message: 'title deve ser uma string.' })
  @MinLength(5, { message: 'title deve ter no mínimo 5 caracteres.' })
  @MaxLength(255, { message: 'title deve ter no máximo 255 caracteres.' })
  title: string

  @IsString({ message: 'description deve ser uma string.' })
  @MinLength(10, { message: 'description deve ter no mínimo 10 caracteres.' })
  @MaxLength(5000, {
    message: 'description deve ter no máximo 5000 caracteres.',
  })
  description: string

  @IsDateString({}, { message: 'deadline deve ser uma data válida.' })
  deadline: string
}