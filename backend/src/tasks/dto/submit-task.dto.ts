import { IsOptional, IsString, MaxLength } from 'class-validator'

export class SubmitTaskDto {
  @IsOptional()
  @IsString({ message: 'observation deve ser uma string.' })
  @MaxLength(5000, {
    message: 'observation deve ter no máximo 5000 caracteres.',
  })
  observation?: string
}