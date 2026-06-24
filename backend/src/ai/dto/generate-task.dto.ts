import { Transform } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'on'
  }
  return false
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter((item) => item.length > 0)
        }
      } catch {
        // cai para split manual abaixo
      }
    }

    return trimmed
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return []
}

export class GenerateTaskDto {
  @IsString({ message: 'O título deve ser um texto.' })
  @MinLength(3, { message: 'Informe o título da tarefa.' })
  title: string

  @IsString({ message: 'O ano da escola deve ser um texto.' })
  @MinLength(1, { message: 'Informe o ano/turma da escola.' })
  schoolYear: string

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  searchWeb = false

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  links: string[] = []

  @IsOptional()
  @IsString()
  refinePrompt?: string

  @IsOptional()
  @IsString()
  historyText?: string
}
