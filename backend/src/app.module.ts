import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { BigIntSerializationInterceptor } from './common/interceptors/bigint-serialization.interceptor'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { AcademicYearsModule } from './academic-years/academic-years.module'
import { ClassesModule } from './classes/classes.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AcademicYearsModule,
    ClassesModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: BigIntSerializationInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
