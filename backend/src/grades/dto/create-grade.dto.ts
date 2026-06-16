import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsInt,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateGradeDto {
  @IsNotEmpty({ message: 'ID da matrícula é obrigatório' })
  @IsInt({ message: 'ID da matrícula deve ser um número inteiro' })
  @Transform(({ value }) => parseInt(value))
  enrollment_id: number

  @IsNotEmpty({ message: 'ID da atribuição é obrigatório' })
  @IsInt({ message: 'ID da atribuição deve ser um número inteiro' })
  @Transform(({ value }) => parseInt(value))
  assignment_id: number

  @IsNotEmpty({ message: 'ID do bimestre é obrigatório' })
  @IsInt({ message: 'ID do bimestre deve ser um número inteiro' })
  @Transform(({ value }) => parseInt(value))
  bimester_id: number

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