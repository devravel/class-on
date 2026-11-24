import { IsString, MaxLength, MinLength } from 'class-validator'

export class SendMessageDto {
  @IsString({ message: 'content deve ser uma string.' })
  @MinLength(1, { message: 'A mensagem não pode estar vazia.' })
  @MaxLength(2000, { message: 'A mensagem deve ter no máximo 2000 caracteres.' })
  content: string
}
