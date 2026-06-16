import { IsInt } from 'class-validator'

export class EnrollStudentDto {
  @IsInt({ message: 'class_id deve ser um número inteiro.' })
  class_id: number
}
