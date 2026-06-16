import { IsArray, IsEnum, IsNotEmpty, IsNumberString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

export class MarkAttendanceItemDto {
  @IsNumberString({}, { message: 'ID do aluno deve ser numérico' })
  @IsNotEmpty({ message: 'ID do aluno é obrigatório' })
  student_id: string

  @IsEnum(AttendanceStatus, { message: 'Status deve ser PRESENT ou ABSENT' })
  status: AttendanceStatus
}

export class MarkAttendanceDto {
  @IsArray({ message: 'Attendances deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => MarkAttendanceItemDto)
  attendances: MarkAttendanceItemDto[]
}