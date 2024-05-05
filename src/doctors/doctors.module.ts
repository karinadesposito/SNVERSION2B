import { Module } from '@nestjs/common';
import { DoctorsController } from './doctors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorsService } from './doctors.service';
import { Schedule } from 'src/schedules/entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Schedule])],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule {}
