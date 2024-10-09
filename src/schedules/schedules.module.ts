import { Module } from '@nestjs/common';
import { ScheduleService } from './schedules.service';
import { ScheduleController } from './schedules.controller';
import { Schedule } from './entities/schedule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from '../doctors/entities/doctor.entity';
import { PatientsService } from '../patients/patients.service';
import { Patient } from '../patients/entities/patient.entity'; 


@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Doctor, Patient])],
  controllers: [ScheduleController],
  providers: [ScheduleService, PatientsService],
})
export class SchedulesModule {}
