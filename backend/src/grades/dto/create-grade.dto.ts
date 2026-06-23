import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { IsBigIntId } from '../../common/dto/is-bigint-id.decorator'

export class CreateGradeDto {
  @IsBigIntId('ID da matrícula deve ser um número válido.')
  enrollment_id: string

  @IsBigIntId('ID da atribuição deve ser um número válido.')
  assignment_id: string

  @IsBigIntId('ID do bimestre deve ser um número válido.')
  bimester_id: string

  @IsNotEmpty({ message: 'N1 é obrigatória' })
  @IsNumber({}, { message: 'N1 deve ser um número' })
  @Min(0, { message: 'N1 deve ser no mínimo 0' })
  @Max(10, { message: 'N1 deve ser no máximo 10' })
  @Transform(({ value }) => parseFloat(value))
  n1: number

  @IsNotEmpty({ message: 'N2 é obrigatória' })
  @IsNumber({}, { message: 'N2 deve ser um número' })
  @Min(0, { message: 'N2 deve ser no mínimo 0' })
  @Max(10, { message: 'N2 deve ser no máximo 10' })
  @Transform(({ value }) => parseFloat(value))
  n2: number

  @IsNotEmpty({ message: 'N3 é obrigatória' })
  @IsNumber({}, { message: 'N3 deve ser um número' })
  @Min(0, { message: 'N3 deve ser no mínimo 0' })
  @Max(10, { message: 'N3 deve ser no máximo 10' })
  @Transform(({ value }) => parseFloat(value))
  n3: number

  @IsNotEmpty({ message: 'N4 é obrigatória' })
  @IsNumber({}, { message: 'N4 deve ser um número' })
  @Min(0, { message: 'N4 deve ser no mínimo 0' })
  @Max(10, { message: 'N4 deve ser no máximo 10' })
  @Transform(({ value }) => parseFloat(value))
  n4: number
}
