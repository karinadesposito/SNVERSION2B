import { Test, TestingModule } from '@nestjs/testing';
import { ShiffService } from './shiff.service';
import { DeleteResult, Repository } from 'typeorm';
import { Shiff } from './entities/shiff.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { ScheduleService } from '../schedules/schedules.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { IResponse } from 'src/interface/IResponse';

describe('ShiffService', () => {
  let service: ShiffService;
  let shiffRepository: Repository<Shiff>;
  let scheduleRepository: Repository<Schedule>;
  let patientRepository: Repository<Patient>;
  let scheduleService: ScheduleService;
  const idSchedule = 1;
  const idPatient = 1;
  const mockShiff: Shiff = {
    id: 1,
    schedule: { idSchedule, available: true } as Schedule,
    idPatient: { id: idPatient } as Patient,
  } as Shiff;
  const id = 1;
  const falseId=123456;
  beforeEach(async () => {
    const mockShiffRepository = {
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
        ShiffService,
        { provide: getRepositoryToken(Shiff), useValue: mockShiffRepository },
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

    service = module.get<ShiffService>(ShiffService);
    shiffRepository = module.get<Repository<Shiff>>(getRepositoryToken(Shiff));
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
  describe('takeShiff', () => {
    it('should create shiff and return the result', async () => {
      const result: IResponse = {
        message: 'El turno se ha guardado',
        data: mockShiff,
        statusCode: HttpStatus.OK,
      };

      jest
        .spyOn(scheduleRepository, 'findOne')
        .mockResolvedValue({ idSchedule, available: true } as Schedule);
      jest
        .spyOn(patientRepository, 'findOne')
        .mockResolvedValue({ id: idPatient } as Patient);
      jest.spyOn(shiffRepository, 'save').mockResolvedValue(mockShiff);

      const updateAvailabilityResult: IResponse = {
        message: 'Availability updated',
        statusCode: HttpStatus.OK,
      };
      jest
        .spyOn(scheduleService, 'updateAvailability')
        .mockResolvedValue(updateAvailabilityResult);

      const response = await service.takeShiff(idSchedule, idPatient);
      expect(response).toEqual(result);
      expect(scheduleRepository.findOne).toHaveBeenCalledWith({
        where: { idSchedule },
      });
      expect(patientRepository.findOne).toHaveBeenCalledWith({
        where: { id: idPatient },
      });
      expect(shiffRepository.save).toHaveBeenCalledWith(expect.any(Shiff));
    });

    it('should throw error if schedule not found', async () => {

      jest.spyOn(scheduleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.takeShiff(idSchedule, idPatient)).rejects.toThrow(
        HttpException,
      );
      await expect(
        service.takeShiff(idSchedule, idPatient),
      ).rejects.toMatchObject({
        response: 'Horario no encontrado',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error if patient not found', async () => {
      jest
        .spyOn(scheduleRepository, 'findOne')
        .mockResolvedValue({ idSchedule, available: true } as Schedule);
      jest.spyOn(patientRepository, 'findOne').mockResolvedValue(null);

      await expect(service.takeShiff(idSchedule, idPatient)).rejects.toThrow(
        HttpException,
      );
      await expect(
        service.takeShiff(idSchedule, idPatient),
      ).rejects.toMatchObject({
        response: 'Paciente no encontrado',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error if schedule not available', async () => {
         jest
        .spyOn(scheduleRepository, 'findOne')
        .mockResolvedValue({ idSchedule, available: false } as Schedule);

      await expect(service.takeShiff(idSchedule, idPatient)).rejects.toThrow(
        HttpException,
      );
      await expect(
        service.takeShiff(idSchedule, idPatient),
      ).rejects.toMatchObject({
        response: 'Horario no disponible',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw internal server error on exception', async () => {
      jest
        .spyOn(scheduleRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.takeShiff(idSchedule, idPatient)).rejects.toThrow(
        HttpException,
      );
      await expect(
        service.takeShiff(idSchedule, idPatient),
      ).rejects.toMatchObject({
        response: 'No se pudo seleccionar el horario',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });
  describe(' getShiff', () => {
    it('should return a list of the shiff', async () => {
      const shiffs = [mockShiff];
      const result: IResponse = {
        message: 'Los turnos existentes son:',
        statusCode: HttpStatus.OK,
        data: shiffs.map((d) => ({
          id: d.id,
          Patient: d.idPatient,
          Schedules: d.schedule,
        })),
      };
      jest.spyOn(shiffRepository, 'find').mockResolvedValue(shiffs);

      const response = await service.getShiff();
      expect(response).toEqual(result);
      expect(shiffRepository.find).toHaveBeenCalledWith({
        relations: ['idDoctor', 'idPatient', 'schedule'],
      });
    });
  });
  describe('findOneShiff', () => {
    it('should return the found shiff', async () => {
      const result: IResponse = {
        message: 'El turno hallado es:',
        statusCode: HttpStatus.OK,
        data: mockShiff,
      };
      jest.spyOn(shiffRepository, 'findOne').mockResolvedValue(mockShiff);

      const response = await service.findOneShiff(id);
      expect(response).toEqual(result);
      expect(shiffRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should handle error if shiff not found', async () => {
      jest.spyOn(shiffRepository, 'findOne').mockResolvedValue(null);
      const response = await service.findOneShiff(falseId);
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
      jest.spyOn(shiffRepository, 'findOne').mockResolvedValue(null);
      const response = await service.findOneShiff(id);
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
  describe('deleteShiff', () => {
    it('should delete shiff and return the result', async () => {
      const result: IResponse = {
        message: 'Se ha eliminado el turno:',
        statusCode: HttpStatus.OK,
        data: mockShiff,
      };

      const deleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };
      jest.spyOn(shiffRepository, 'delete').mockResolvedValue(deleteResult);
      jest.spyOn(service, 'deleteShiff').mockResolvedValue(result);
      const response = await service.deleteShiff(id);
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
      jest.spyOn(shiffRepository, 'findOne').mockResolvedValue(mockShiff);
      jest
        .spyOn(shiffRepository, 'delete')
        .mockRejectedValue(
          new Error('Ha ocurrido un error. No se logró eliminar el turno'),
        );
      try {
        await service.deleteShiff(id);
      } catch (error) {
        expect(error.message).toBe(
          'Ha ocurrido un error. No se logró eliminar el turno',
        );
        expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
    it('should handle non-existing shiff', async () => {

      jest.spyOn(shiffRepository, 'findOne').mockResolvedValue(null);

      const response = await service.deleteShiff(id);

      expect(response).toEqual({
        message: 'El turno no ha sido encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });
});
