import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedules.controller';
import { ScheduleService } from './schedules.service';

describe('SchedulesController', () => {
  let controller: ScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [ScheduleService],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
