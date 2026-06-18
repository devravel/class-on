import { BadRequestException } from '@nestjs/common'
import { EducationLevel } from './dto/create-class.dto'

export function validateSeriesForEducationLevel(
  series: number,
  educationLevel: EducationLevel,
): void {
  if (!Number.isInteger(series)) {
    throw new BadRequestException('series deve ser um número inteiro.')
  }

  if (educationLevel === EducationLevel.MEDIO) {
    if (series < 1 || series > 3) {
      throw new BadRequestException(
        'Para Ensino Médio, a série deve ser 1, 2 ou 3.',
      )
    }
    return
  }

  if (series < 1 || series > 9) {
    throw new BadRequestException(
      'Para Ensino Fundamental, a série deve ser entre 1 e 9.',
    )
  }
}
