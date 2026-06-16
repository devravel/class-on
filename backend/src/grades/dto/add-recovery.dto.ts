import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class AddRecoveryDto {
  @IsNotEmpty({ message: 'Nota de recuperação é obrigatória' })
  @IsNumber({}, { message: 'Nota de recuperação deve ser um número' })
  @Min(0, { message: 'Nota de recuperação deve ser no mínimo 0' })
  @Max(10, { message: 'Nota de recuperação deve ser no máximo 10' })
  @Transform(({ value }) => parseFloat(value))
  recovery_grade: number
}