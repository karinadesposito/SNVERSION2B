import { Module } from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { SpecialityController } from './speciality.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Speciality } from './entities/speciality.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Speciality])],
  controllers: [SpecialityController],
  providers: [SpecialityService],
})
export class SpecialityModule {}
