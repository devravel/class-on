import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common'

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string, metadata: ArgumentMetadata): bigint {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException(
        `Parâmetro "${metadata.data ?? 'id'}" é obrigatório.`,
      )
    }

    if (!/^\d+$/.test(value)) {
      throw new BadRequestException(
        `Parâmetro "${metadata.data ?? 'id'}" inválido: "${value}".`,
      )
    }

    try {
      return BigInt(value)
    } catch {
      throw new BadRequestException(
        `Parâmetro "${metadata.data ?? 'id'}" inválido: "${value}".`,
      )
    }
  }
}

@Injectable()
export class ParseOptionalBigIntPipe implements PipeTransform<
  string | undefined,
  bigint | undefined
> {
  transform(
    value: string | undefined,
    metadata: ArgumentMetadata,
  ): bigint | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined
    }

    if (!/^\d+$/.test(value)) {
      throw new BadRequestException(
        `Parâmetro "${metadata.data ?? 'id'}" inválido: "${value}".`,
      )
    }

    try {
      return BigInt(value)
    } catch {
      throw new BadRequestException(
        `Parâmetro "${metadata.data ?? 'id'}" inválido: "${value}".`,
      )
    }
  }
}
