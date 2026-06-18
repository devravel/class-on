import { IsIn } from 'class-validator'

export class UpdateBimesterStatusDto {
  @IsIn(['ABERTO', 'FECHADO'], { message: 'Status deve ser ABERTO ou FECHADO.' })
  status: string
}
