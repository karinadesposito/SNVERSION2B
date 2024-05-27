import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedules.controller';
import { ScheduleService } from './schedules.service';

describe('SchedulesController', () => {
  let controller: ScheduleController;
  let service: ScheduleService;

  beforeEach(async () => {
    const mockSchedulesService = {
      create: jest.fn(),
      findAllSchedules: jest.fn(),
      findOneSchedule: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateAvailability: jest.fn(),
      getCountTake: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        {
          provide: ScheduleService,
          useValue: mockSchedulesService,
        },
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
    service= module.get<ScheduleService>(ScheduleService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
