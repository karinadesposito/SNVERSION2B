import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedules.service';
import { Schedule } from './entities/schedule.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SchedulesService', () => {
  let service: ScheduleService;
  let repository: Repository<Schedule>;
  beforeEach(async () => {
    const mockRepository = {
      createScheduleWithInterval: jest.fn(),
      getSchedules: jest.fn(),
      findOneSchedule: jest.fn(),
      updateSchedule: jest.fn(),
      deleteSchedule: jest.fn(),
      updateAvailability: jest.fn(),
      findScheduleByDay: jest.fn(),
      countScheduleByDoctor: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: getRepositoryToken(Schedule), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    repository = module.get<Repository<Schedule>>(getRepositoryToken(Schedule));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
