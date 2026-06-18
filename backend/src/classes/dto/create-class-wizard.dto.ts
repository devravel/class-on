import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { CreateClassDto } from './create-class.dto'
import { WizardManualStudentDto } from './wizard-manual-student.dto'

export class CreateClassWizardDto extends CreateClassDto {
  @IsOptional()
  @IsArray({ message: 'teacher_ids deve ser um array.' })
  @IsInt({ each: true, message: 'Cada teacher_id deve ser um número inteiro.' })
  teacher_ids?: number[]

  @IsOptional()
  @IsArray({ message: 'manual_students deve ser um array.' })
  @ArrayMinSize(1, { message: 'Informe ao menos um aluno no cadastro manual.' })
  @ValidateNested({ each: true })
  @Type(() => WizardManualStudentDto)
  manual_students?: WizardManualStudentDto[]

  @IsOptional()
  @IsInt({ message: 'bulk_student_count deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade mínima de alunos é 1.' })
  @Max(200, { message: 'A quantidade máxima de alunos por lote é 200.' })
  bulk_student_count?: number
}
