import { Test, TestingModule } from '@nestjs/testing';
import { ShiftService } from './shift.service';
import { Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { ScheduleService } from '../schedules/schedules.service';
import { HttpStatus } from '@nestjs/common';
import { IResponse } from 'src/interface/IResponse';

describe('ShiftService', () => {
  let service: ShiftService;
  let shiftRepository: Repository<Shift>;
  let scheduleRepository: Repository<Schedule>;
  let patientRepository: Repository<Patient>;
  let scheduleService: ScheduleService;

  beforeEach(async () => {
    const mockShiftRepository = {
      takeShift: jest.fn(),
      getShift: jest.fn(),
      findOneShift: jest.fn(),
      deleteShift: jest.fn(),
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
        {
          provide: getRepositoryToken(Schedule),
          useValue: mockScheduleRepository,
        },
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientRepository,
        },
        { provide: ScheduleService, useValue: mockScheduleService },
      ],
    }).compile();

    service = module.get<ShiftService>(ShiftService);
    shiftRepository = module.get<Repository<Shift>>(getRepositoryToken(Shift));
    scheduleRepository = module.get<Repository<Schedule>>(
      getRepositoryToken(Schedule),
    );
    patientRepository = module.get<Repository<Patient>>(
      getRepositoryToken(Patient),
    );
    scheduleService = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('takeShift', () => {
    it('should call shiftService.takeShift and return the result', async () => {
      const idSchedule = '1ada55';
      const idPatient = '5cec5f';

      const result: IResponse = {
        message: 'El turno se ha guardado',
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(service, 'takeShift').mockResolvedValue(result);

      const response = await service.takeShift(idSchedule, idPatient);
      expect(response).toEqual(result);
      expect(service.takeShift).toHaveBeenCalledWith(idSchedule, idPatient);
    });
  });
  describe(' getShift', () => {
    it('should call shiftService.getShift and return the result', async () => {
      const result: IResponse = {
        message: 'El turno se ha guardado',
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(service, 'getShift').mockResolvedValue(result);

      const response = await service.getShift();
      expect(response).toEqual(result);
      expect(service.getShift).toHaveBeenCalledWith();
    });
  });
  describe('findOneShift', () => {
    it('should call shiftService.findOneShift and return the result', async () => {
      const id = '4d87d5';
      const result: IResponse = {
        message: 'El turno se ha guardado',
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(service, 'findOneShift').mockResolvedValue(result);

      const response = await service.findOneShift(id);
      expect(response).toEqual(result);
      expect(service.findOneShift).toHaveBeenCalledWith(id);
    });
  });
  describe('deleteShift', () => {
    it('should call shiftService.deleteShift and return the result', async () => {
      const id = '4d87d5';
      const result: IResponse = {
        message: 'El turno se ha guardado',
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(service, 'deleteShift').mockResolvedValue(result);

      const response = await service.deleteShift(id);
      expect(response).toEqual(result);
      expect(service.deleteShift).toHaveBeenCalledWith(id);
    });
  });
});
