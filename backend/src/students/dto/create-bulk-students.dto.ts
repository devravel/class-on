import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator'
import { CreateStudentDto } from './create-student.dto'

export class CreateBulkStudentsDto {
  @IsArray({ message: 'students deve ser um array.' })
  @ArrayMinSize(1, { message: 'students deve conter pelo menos 1 aluno.' })
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students: CreateStudentDto[]
}
