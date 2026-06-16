import { IsString, Matches } from 'class-validator'

export class CreateAssignmentDto {
  @IsString({ message: 'teacher_id deve ser uma string.' })
  @Matches(/^\d+$/, { message: 'teacher_id deve ser um número válido.' })
  teacher_id: string

  @IsString({ message: 'class_id deve ser uma string.' })
  @Matches(/^\d+$/, { message: 'class_id deve ser um número válido.' })
  class_id: string

  @IsString({ message: 'subject_id deve ser uma string.' })
  @Matches(/^\d+$/, { message: 'subject_id deve ser um número válido.' })
  subject_id: string
}
