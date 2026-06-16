import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { BigIntSerializationInterceptor } from './common/interceptors/bigint-serialization.interceptor'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { AcademicYearsModule } from './academic-years/academic-years.module'
import { ClassesModule } from './classes/classes.module'
import { TeachersModule } from './teachers/teachers.module'
import { StudentsModule } from './students/students.module'
import { SubjectsModule } from './subjects/subjects.module'
import { AssignmentsModule } from './assignments/assignments.module'
import { LessonsModule } from './lessons/lessons.module'
import { AttendanceModule } from './attendance/attendance.module'
import { GradesModule } from './grades/grades.module'
import { TasksModule } from './tasks/tasks.module'
import { AnnouncementsModule } from './announcements/announcements.module'
import { EventsModule } from './events/events.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AcademicYearsModule,
    ClassesModule,
    TeachersModule,
    StudentsModule,
    SubjectsModule,
    AssignmentsModule,
    LessonsModule,
    AttendanceModule,
    GradesModule,
    TasksModule,
    AnnouncementsModule,
    EventsModule,
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
