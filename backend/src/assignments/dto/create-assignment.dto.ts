import { IsString, Matches } from 'class-validator'
import { IsBigIntId } from '../../common/dto/is-bigint-id.decorator'

export class CreateAssignmentDto {
  @IsBigIntId('teacher_id deve ser um número válido.')
  teacher_id: string

  @IsBigIntId('class_id deve ser um número válido.')
  class_id: string

  @IsBigIntId('subject_id deve ser um número válido.')
  subject_id: string
}
