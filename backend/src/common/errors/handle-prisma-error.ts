import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'

type PrismaErrorCode = 'P2002' | 'P2025' | string

interface PrismaKnownError {
  code: PrismaErrorCode
  clientVersion?: string
  meta?: unknown
}

function isPrismaKnownError(error: unknown): error is PrismaKnownError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string' &&
    (error as { code: string }).code.startsWith('P')
  )
}

export function handlePrismaError(error: unknown): never {
  if (error instanceof HttpException) {
    throw error
  }

  if (isPrismaKnownError(error)) {
    if (error.code === 'P2002') {
      throw new BadRequestException('Já existe um registro com esses dados')
    }

    if (error.code === 'P2003') {
      throw new BadRequestException(
        'Referência inválida ao vincular dados (professor, disciplina ou turma).',
      )
    }

    if (error.code === 'P2025') {
      throw new NotFoundException('Registro não encontrado')
    }

    if (error.code === 'P2028') {
      throw new BadRequestException(
        'A operação demorou demais. Reduza a quantidade de alunos ou tente novamente.',
      )
    }

    throw new InternalServerErrorException(
      'Erro ao processar operação no banco de dados',
    )
  }

  throw error
}
