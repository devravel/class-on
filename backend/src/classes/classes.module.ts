import { Module } from '@nestjs/common'
import { ClassWizardService } from './class-wizard.service'
import { ClassesController } from './classes.controller'
import { ClassesService } from './classes.service'

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, ClassWizardService],
  exports: [ClassesService],
})
export class ClassesModule {}
