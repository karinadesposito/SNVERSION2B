import { Test, TestingModule } from '@nestjs/testing';
import { ShiftService } from './shift.service';
import { DeleteResult, Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { ScheduleService } from '../schedules/schedules.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { IResponse } from 'src/interface/IResponse';

describe('ShiftService', () => {
  let service: ShiftService;
  let shiftRepository: Repository<Shift>;
  let scheduleRepository: Repository<Schedule>;
  let patientRepository: Repository<Patient>;
  let scheduleService: ScheduleService;
  const idSchedule = '1ada55';
  const idPatient = '5cec5f';
  const mockShift: Shift = {
    id: 'c66a01',
    schedule: { idSchedule, available: true } as Schedule,
    idPatient: { id: idPatient } as Patient,
  } as Shift;

  beforeEach(async () => {
    const mockShiftRepository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
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
    it('should create shift and return the result', async () => {
      const result: IResponse = {
        message: 'El turno se ha guardado',
        data: mockShift,
        statusCode: HttpStatus.OK,
      };

      jest
        .spyOn(scheduleRepository, 'findOne')
        .mockResolvedValue({ idSchedule, available: true } as Schedule);
      jest
        .spyOn(patientRepository, 'findOne')
        .mockResolvedValue({ id: idPatient } as Patient);
      jest.spyOn(shiftRepository, 'save').mockResolvedValue(mockShift);

      const updateAvailabilityResult: IResponse = {
        message: 'Availability updated',
        statusCode: HttpStatus.OK,
      };
      jest
        .spyOn(scheduleService, 'updateAvailability')
        .mockResolvedValue(updateAvailabilityResult);

      const response = await service.takeShift(idSchedule, idPatient);
      expect(response).toEqual(result);
      expect(scheduleRepository.findOne).toHaveBeenCalledWith({
        where: { idSchedule },
      });
      expect(patientRepository.findOne).toHaveBeenCalledWith({
        where: { id: idPatient },
      });
      expect(shiftRepository.save).toHaveBeenCalledWith(expect.any(Shift));
    });

    it('should throw error if schedule not found', async () => {
      const idSchedule = '1ada55';
      const idPatient = '5cec5f';

      jest.spyOn(scheduleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.takeShift(idSchedule, idPatient)).rejects.toThrow(
        HttpException,
      );
      await expect(
        service.takeShift(idSchedule, idPatient),
      ).rejects.toMatchObject({
        response: 'Horario no encontrado',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error if patient not found', async () => {
      const idSchedule = '1ada55';
      const idPatient = '5cec5f';

      jest
        .spyOn(scheduleRepository, 'findOne')
        .mockResolvedValue({ idSchedule, available: true } as Schedule);
      jest.spyOn(patientRepository, 'findOne').mockResolvedValue(null);

      await expect(service.takeShift(idSchedule, idPatient)).rejects.toThrow(
        HttpException,
      );
      await expect(
        service.takeShift(idSchedule, idPatient),
      ).rejects.toMatchObject({
        response: 'Paciente no encontrado',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error if schedule not available', async () => {
      const idSchedule = '1ada55';
      const idPatient = '5cec5f';

      jest
        .spyOn(scheduleRepository, 'findOne')
        .mockResolvedValue({ idSchedule, available: false } as Schedule);

      await expect(service.takeShift(idSchedule, idPatient)).rejects.toThrow(
        HttpException,
      );
      await expect(
        service.takeShift(idSchedule, idPatient),
      ).rejects.toMatchObject({
        response: 'Horario no disponible',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw internal server error on exception', async () => {
      const idSchedule = '1ada55';
      const idPatient = '5cec5f';

      jest
        .spyOn(scheduleRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.takeShift(idSchedule, idPatient)).rejects.toThrow(
        HttpException,
      );
      await expect(
        service.takeShift(idSchedule, idPatient),
      ).rejects.toMatchObject({
        response: 'No se pudo seleccionar el horario',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });
  describe(' getShift', () => {
    it('should return a list of the shift', async () => {
      const shifts = [mockShift];
      const result: IResponse = {
        message: 'Los turnos existentes son:',
        statusCode: HttpStatus.OK,
        data: shifts.map((d) => ({
          id: d.id,
          Patient: d.idPatient,
          Schedules: d.schedule,
        })),
      };
      jest.spyOn(shiftRepository, 'find').mockResolvedValue(shifts);

      const response = await service.getShift();
      expect(response).toEqual(result);
      expect(shiftRepository.find).toHaveBeenCalledWith({
        relations: ['idDoctor', 'idPatient', 'schedule'],
      });
    });
  });
  describe('findOneShift', () => {
    it('should return the found shift', async () => {
      const id = '4d87d5';
      const result: IResponse = {
        message: 'El turno hallado es:',
        statusCode: HttpStatus.OK,
        data: mockShift,
      };
      jest.spyOn(shiftRepository, 'findOne').mockResolvedValue(mockShift);

      const response = await service.findOneShift(id);
      expect(response).toEqual(result);
      expect(shiftRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should handle error if shift not found', async () => {
      const id = '123456';
      jest.spyOn(shiftRepository, 'findOne').mockResolvedValue(null);
      const response = await service.findOneShift(id);
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual('El turno no fue hallado');
        expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
        expect(response.data).toBeUndefined();
      }
    });

    it('should handle internal server error', async () => {
      const id = '4d87d5';
      jest.spyOn(shiftRepository, 'findOne').mockResolvedValue(null);
      const response = await service.findOneShift(id);
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual(
          'Ha ocurrido una falla en la búsqueda',
        );
        expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.data).toBeUndefined();
      }
    });
  });
  describe('deleteShift', () => {
    it('should delete shift and return the result', async () => {
      const id = '4d87d5';
      const result: IResponse = {
        message: 'Se ha eliminado el turno:',
        statusCode: HttpStatus.OK,
        data: mockShift,
      };

      const deleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };
      jest.spyOn(shiftRepository, 'delete').mockResolvedValue(deleteResult);
      jest.spyOn(service, 'deleteShift').mockResolvedValue(result);
      const response = await service.deleteShift(id);
      expect(response).toEqual(result);
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual('Se ha eliminado el turno:');
        expect(response.data).toEqual(result.data);
        expect(response.statusCode).toEqual(HttpStatus.OK);
      }
    });
    it('should handle error during deletion', async () => {
      const id = '89820e';
      jest.spyOn(shiftRepository, 'findOne').mockResolvedValue(mockShift);
      jest
        .spyOn(shiftRepository, 'delete')
        .mockRejectedValue(
          new Error('Ha ocurrido un error. No se logró eliminar el turno'),
        );
      try {
        await service.deleteShift(id);
      } catch (error) {
        expect(error.message).toBe(
          'Ha ocurrido un error. No se logró eliminar el turno',
        );
        expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
    it('should handle non-existing shift', async () => {
      const id = '89820e';
      jest.spyOn(shiftRepository, 'findOne').mockResolvedValue(null);

      const response = await service.deleteShift(id);

      expect(response).toEqual({
        message: 'El turno no ha sido encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });
});
