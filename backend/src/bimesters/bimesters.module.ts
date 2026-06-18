import { Module } from '@nestjs/common'
import { BimestersController } from './bimesters.controller'
import { BimestersService } from './bimesters.service'

@Module({
  controllers: [BimestersController],
  providers: [BimestersService],
  exports: [BimestersService],
})
export class BimestersModule {}
