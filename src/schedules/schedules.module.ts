import { Module } from '@nestjs/common';
import { ScheduleService } from './schedules.service';
import { ScheduleController } from './schedules.controller';
import { Schedule } from './entities/schedule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Doctor])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class SchedulesModule {}
