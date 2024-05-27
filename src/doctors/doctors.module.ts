import { Module } from '@nestjs/common';
import { DoctorsController } from './doctors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorsService } from './doctors.service';
import { Coverage } from '../coverage/entities/coverage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor,Coverage])],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule {}
