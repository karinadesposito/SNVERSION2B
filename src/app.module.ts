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


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      username: 'root',
      password: 'root',
      port: 3306,
      database: 'saludnet2',
      entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
      synchronize: true,
    }),
    PatientsModule,
    DoctorsModule,
    SchedulesModule,
    ShiftModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
