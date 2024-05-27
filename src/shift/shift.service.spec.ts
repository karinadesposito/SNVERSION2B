import { Test, TestingModule } from '@nestjs/testing';
import { ShiftService } from './shift.service';
import { Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { ScheduleService } from '../schedules/schedules.service';

describe('ShiftService', () => {
  let service: ShiftService;
  let shiftRepository: Repository<Shift>;
  let scheduleRepository: Repository<Schedule>;
  let patientRepository: Repository<Patient>;
  let scheduleService: ScheduleService;

  beforeEach(async () => {
    const mockShiftRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };
    const mockScheduleRepository = {
      findOne: jest.fn(),
    };
    const mockPatientRepository = {
      findOne: jest.fn(),
    };
    const mockScheduleService = {
      updateAvailability: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftService,
        { provide: getRepositoryToken(Shift), useValue: mockShiftRepository },
        { provide: getRepositoryToken(Schedule), useValue: mockScheduleRepository },
        { provide: getRepositoryToken(Patient), useValue: mockPatientRepository },
        { provide: ScheduleService, useValue: mockScheduleService },
      ],
    }).compile();

    service = module.get<ShiftService>(ShiftService);
    shiftRepository = module.get<Repository<Shift>>(getRepositoryToken(Shift));
    scheduleRepository = module.get<Repository<Schedule>>(getRepositoryToken(Schedule));
    patientRepository = module.get<Repository<Patient>>(getRepositoryToken(Patient));
    scheduleService = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});