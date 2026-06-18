import { IsString, MinLength } from 'class-validator'

export class UpdateTeacherPasswordDto {
  @IsString({ message: 'password deve ser uma string.' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres.' })
  password: string
}
