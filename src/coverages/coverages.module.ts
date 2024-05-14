import { Module } from '@nestjs/common';
import { CoveragesService } from './coverages.service';
import { CoveragesController } from './coverages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coverage } from './entities/coverage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coverage])],
  controllers: [CoveragesController],
  providers: [CoveragesService],
})
export class CoveragesModule {}
