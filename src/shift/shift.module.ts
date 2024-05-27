import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { ScheduleService } from '../schedules/schedules.service';
@Module({
  imports: [TypeOrmModule.forFeature([Shift, Doctor, Schedule, Patient])],
  controllers: [ShiftController],
  providers: [ShiftService, ScheduleService],
})
export class ShiftModule {}
