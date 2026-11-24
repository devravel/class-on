import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
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
import { WizardImportedStudentDto } from './wizard-imported-student.dto'
import { IsBigIntIdArray } from '../../common/dto/is-bigint-id.decorator'

export class CreateClassWizardDto extends CreateClassDto {
  @IsOptional()
  @IsArray({ message: 'teacher_ids deve ser um array.' })
  @IsBigIntIdArray('Cada teacher_id deve ser um número válido.')
  teacher_ids?: string[]

  @IsOptional()
  @IsArray({ message: 'manual_students deve ser um array.' })
  @ArrayMinSize(1, { message: 'Informe ao menos um aluno no cadastro manual.' })
  @ValidateNested({ each: true })
  @Type(() => WizardManualStudentDto)
  manual_students?: WizardManualStudentDto[]

  @IsOptional()
  @IsArray({ message: 'imported_students deve ser um array.' })
  @ArrayMinSize(1, { message: 'A lista importada precisa de ao menos um aluno.' })
  @ArrayMaxSize(200, { message: 'A lista importada aceita no máximo 200 alunos.' })
  @ValidateNested({ each: true })
  @Type(() => WizardImportedStudentDto)
  imported_students?: WizardImportedStudentDto[]

  @IsOptional()
  @IsInt({ message: 'bulk_student_count deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade mínima de alunos é 1.' })
  @Max(200, { message: 'A quantidade máxima de alunos por lote é 200.' })
  bulk_student_count?: number
}
