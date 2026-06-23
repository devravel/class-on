import { IsBigIntId } from '../../common/dto/is-bigint-id.decorator'

export class EnrollStudentDto {
  @IsBigIntId('class_id deve ser um número válido.')
  class_id: string
}
