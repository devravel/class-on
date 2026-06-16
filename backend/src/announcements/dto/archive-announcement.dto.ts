import { IsString, IsIn } from 'class-validator'

export class ArchiveAnnouncementDto {
  @IsString({ message: 'status deve ser uma string.' })
  @IsIn(['ACTIVE', 'ARCHIVED'], {
    message: 'status deve ser ACTIVE ou ARCHIVED.',
  })
  status: string
}