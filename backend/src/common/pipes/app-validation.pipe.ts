import { ArgumentMetadata, ValidationPipe, ValidationPipeOptions } from '@nestjs/common'

/**
 * ValidationPipe global que ignora metatype BigInt.
 * Parâmetros bigint são convertidos por ParseBigIntPipe — class-transformer
 * não suporta `new BigInt()` e quebra com transform: true.
 */
export class AppValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super(options)
  }

  protected toValidate(metadata: ArgumentMetadata): boolean {
    if ((metadata.metatype as unknown) === BigInt) {
      return false
    }
    return super.toValidate(metadata)
  }
}
