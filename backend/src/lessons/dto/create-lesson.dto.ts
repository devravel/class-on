import { IsDateString, IsInt, IsNotEmpty, IsNumberString, MaxLength, Min } from 'class-validator'

export class CreateLessonDto {
  @IsNumberString({}, { message: 'ID da atribuição deve ser numérico' })
  @IsNotEmpty({ message: 'ID da atribuição é obrigatório' })
  assignment_id: string

  @IsDateString({}, { message: 'Data deve estar no formato válido (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Data é obrigatória' })
  date: string

  @IsInt({ message: 'Ordem da aula deve ser um número inteiro' })
  @Min(1, { message: 'Ordem da aula deve ser pelo menos 1' })
  lesson_order: number

  @IsNotEmpty({ message: 'Conteúdo é obrigatório' })
  @MaxLength(500, { message: 'Conteúdo deve ter no máximo 500 caracteres' })
  content: string
}