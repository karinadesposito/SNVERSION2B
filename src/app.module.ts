import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './patients/patients.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DoctorsModule } from './doctors/doctors.module';
import { ShiftModule } from './shift/shift.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DB_NAME, DB_TYPE, HOST, PORT, USER_DB_NAME, USER_DB_PASSWORD } from 'config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: DB_TYPE,
      host: HOST,
      username: USER_DB_NAME,
      password: USER_DB_PASSWORD,
      port:PORT,
      database: DB_NAME,
      entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
      synchronize: true,
    }),
    PatientsModule,
    DoctorsModule,
    SchedulesModule,
    ShiftModule,
    AdminModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
