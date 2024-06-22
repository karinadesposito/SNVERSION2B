import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import {
  DB_NAME,
  DB_TYPE,
  HOST,
  PORT,
  USER_DB_NAME,
  USER_DB_PASSWORD,
} from '../config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { ShiffModule } from './shiff/shiff.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { SpecialityModule } from './speciality/speciality.module';
import { CoverageModule } from './coverage/coverage.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: DB_TYPE,
      host: HOST,
      username: USER_DB_NAME,
      password: USER_DB_PASSWORD,
      port: PORT,
      database: DB_NAME,
      entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
      synchronize: true,
    }),
    PatientsModule,
    DoctorsModule,
    SchedulesModule,
    ShiffModule,
    AdminModule,
    AuthModule,
    SpecialityModule,
    CoverageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
