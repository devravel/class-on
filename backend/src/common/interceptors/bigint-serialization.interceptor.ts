import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * JSON.stringify não serializa BigInt (campos Prisma id BigInt).
 * Converte recursivamente para string na saída HTTP, preservando Date e estruturas comuns.
 */
@Injectable()
export class BigIntSerializationInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.serialize(data)))
  }

  private serialize(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value
    }

    if (typeof value === 'bigint') {
      return value.toString()
    }

    if (value instanceof Date) {
      return value
    }

    if (typeof value === 'object') {
      const decimalLike = value as { toNumber?: () => number }
      if (typeof decimalLike.toNumber === 'function') {
        return decimalLike.toNumber()
      }
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serialize(item))
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      const out: Record<string, unknown> = {}
      for (const key of Object.keys(record)) {
        out[key] = this.serialize(record[key])
      }
      return out
    }

    return value
  }
}
