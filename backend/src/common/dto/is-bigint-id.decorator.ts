import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

function toNumericString({ value }: { value: unknown }): unknown {
  if (value === undefined || value === null) {
    return value
  }

  return String(value)
}

export function IsBigIntId(message = 'ID deve ser um número válido.') {
  return applyDecorators(
    Transform(toNumericString),
    IsNotEmpty({ message }),
    IsString({ message: 'ID deve ser informado como string numérica.' }),
    Matches(/^\d+$/, { message }),
  )
}

export function IsOptionalBigIntId(message = 'ID deve ser um número válido.') {
  return applyDecorators(
    Transform(toNumericString),
    IsOptional(),
    IsString({ message: 'ID deve ser informado como string numérica.' }),
    Matches(/^\d+$/, { message }),
  )
}

export function IsBigIntIdArray(message = 'Cada ID deve ser um número válido.') {
  return applyDecorators(
    Transform(({ value }) =>
      Array.isArray(value) ? value.map((item) => String(item)) : value,
    ),
    IsString({ each: true, message: 'Cada ID deve ser informado como string numérica.' }),
    Matches(/^\d+$/, { each: true, message }),
  )
}
