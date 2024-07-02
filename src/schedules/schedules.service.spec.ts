import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedules.service';
import { Schedule } from './entities/schedule.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeletionReason } from './enum/deleteSchedule.enum';
import { Doctor } from '../doctors/entities/doctor.entity';

describe('SchedulesService', () => {
  let service: ScheduleService;
  let repository: Repository<Schedule>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const createSch: CreateScheduleDto = {
    day: '2024-05-29',
    idDoctor: 1,
    start_Time: '14:30:00',
    end_Time: '15:00:00',
    available: true,
    interval: '30',
  };

  const deletionReason: DeletionReason = DeletionReason.other;

  const schedule: Schedule = {
    ...createSch,
    deletionReason: null,
    removed: false,
    idSchedule: 1,
    idDoctors: {
      id: 1,
      fullName: 'Mariana Perez',
      mail: 'docmperez@saludnet.com',
      phone: '02281457423',
      license: 'MP 75405',
      speciality: {
        name: 'Cardiologia',
        id: 1,
        idDoctor: [],
      },
      deletedAt: undefined,
      schedule: [],
      coverages: [],
      createAt: undefined,
      hasId: null,
      save: null,
      remove: null,
      softRemove: null,
      recover: null,
      reload: null,
    },
    shiff: {
      id: 1,
      idPatient: {
        fullName: 'Luis Garcia',
        mail: 'larcia@gmail.com',
        phone: '02281457898',
        coverage: {
          id: 1,
          coverages: 'ioma',
          doctors: [],
        },
        dni: '18485754',
        birthday: new Date('1974-12-02'),
        address: 'Sarmiento 224',
        shiffs: [],
        id: 1,
        createAt: null,
        hasId: null,
        save: null,
        remove: null,
        softRemove: null,
        recover: null,
        reload: null,
      },
      schedule: null,
    },
  };
  const updateResult: UpdateResult = {
    affected: 1,
    raw: {},
    generatedMaps: [],
  };
  const scheduleTwo = {
    ...schedule,
    available: false,
  };
  const id = 1;
  const schedules = { ...schedule };
  const falseId = 123456;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: getRepositoryToken(Schedule), useValue: mockRepository },
        { provide: getRepositoryToken(Doctor), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    repository = module.get<Repository<Schedule>>(getRepositoryToken(Schedule));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new schedule', async () => {
      const result: IResponse = {
        message: `La agenda ha sido creada exitosamente`,
        statusCode: HttpStatus.CREATED,
        data: [
          {
            Doctor: createSch.idDoctor,
            Dia: createSch.day,
            Hora: createSch.start_Time,
          },
        ],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(schedule);
      jest.spyOn(repository, 'save').mockResolvedValue(schedule);

      try {
        await service.createScheduleWithInterval(createSch);
      } catch (error) {
        expect(error.message).toBe(
          `El doctor con id ${createSch.idDoctor} no existe`,
        );
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return conflict if schedules already exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(schedule);
      try {
        await service.createScheduleWithInterval(createSch);
      } catch (error) {
        expect(error.message).toBe(
          `La agenda para el ${schedules.day} y médico ${schedules.idDoctor} ya existe`,
        );
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });
  });
  describe('find', () => {
    it('should return a list of schedules', async () => {
      const schedules = [{ ...schedule }];
      const result: IResponse = {
        message: 'Agendas registradas:',
        statusCode: HttpStatus.OK,
        data: schedules,
      };
      jest.spyOn(repository, 'find').mockResolvedValue(schedules);

      const response = await service.getSchedules();

      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(repository.find).toHaveBeenCalled();
    });
    it('should return "No existen agendas registradas"when there are no schedules', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

      try {
        await service.getSchedules();
      } catch (error) {
        expect(error.message).toBe('No existen agendas registradas');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
    it('should handle error if list coverages not found', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(new Error('Error del servidor'));
      try {
        await service.getSchedules();
      } catch (error) {
        expect(error.message).toBe('Error del servidor');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
  describe('findOne', () => {
    it('should return a schedule if found', async () => {
      const result: IResponse = {
        message: 'La agenda encontrada es:',
        statusCode: HttpStatus.OK,
        data: schedules,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(schedules);
      const response = await service.findOneSchedule(id);
      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenLastCalledWith({
        where: { idSchedule: id },
      });
    });
    it('should return "Esa agenda no existe" when not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
    
      try {
        await service.findOneSchedule(id);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException); 
        expect(error.message).toEqual('Esa agenda no existe');
        expect(error.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });
    it('should handle error if coverage not found', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Error del servidor'));

      try {
        await service.findOneSchedule(falseId);
      } catch (error) {
        expect(error.message).toBe('Error del servidor');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('delete', () => {
    it('should call delete', async () => {
      const result = {
        message: 'Se ha eliminado la agenda con id: ',
        statusCode: HttpStatus.OK,
        data: id,
      };
      const deleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };
      jest.spyOn(service, 'deleteSchedule').mockResolvedValue(result);
      jest.spyOn(repository, 'delete').mockRejectedValue(deleteResult);
      const response = await service.deleteSchedule(id, deletionReason);
      expect(response).toBeDefined();
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual('Se ha eliminado la agenda con id: ');
        expect(response.data).toEqual(result.data);
        expect(response.statusCode).toEqual(HttpStatus.OK);
      }
    });
    it('should handle deletion error', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockRejectedValue(new Error('Error del servidor'));

      try {
        await service.deleteSchedule(falseId, deletionReason);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual('Error del servidor');
        expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
    it('should handle coverage not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.deleteSchedule(falseId, deletionReason);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(`La agenda con ${falseId} no existe`);
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });
  });
  describe('findScheduleByDay', () => {
    it('should return the found schedules of the day', async () => {
      const schedules: Schedule[] = [
        {
          ...schedule,
        },
      ];
      const result: IResponse = {
        message: 'Turnos tomamos en este dia:',
        statusCode: HttpStatus.OK,
        data: schedules,
      };
  
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue({ id: schedule.idDoctor }); 
      jest.spyOn(repository, 'find').mockResolvedValue(schedules);
  
      const response = await service.findScheduleByDay(
        schedule.day,
        schedule.idDoctor,
      );
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          day: schedule.day,
          idDoctor: schedule.idDoctor,
          available: false,
        },
        relations: ['idDoctors', 'shiff'], 
      });
    });
  });
 
  it('should throw HttpException when doctor is not found', async () => {
    jest.spyOn(mockRepository, 'findOne').mockResolvedValue(null);

    try {
      await service.countScheduleByDoctor(schedule.day, schedule.idDoctor);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('No existe el doctor indicado');
      expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    }

    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: schedule.idDoctor } });
  });

  it('should throw HttpException when server error occurs', async () => {
    jest.spyOn(mockRepository, 'findOne').mockImplementation(() => { throw new Error(); });

    try {
      await service.countScheduleByDoctor(schedule.day, schedule.idDoctor);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('Error del servidor');
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
 
  describe('updateAvailability', () => {
    it('should throw an error if the schedule does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      try {
        await service.updateAvailability(123456);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('El turno no existe');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { idSchedule: 123456 },
      });
    });

    it('should update the availability from true to false', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(scheduleTwo)
        .mockResolvedValueOnce({ ...scheduleTwo, available: true });

      jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

      const result = await service.updateAvailability(1);

      expect(result).toEqual({
        message: 'Se ha cancelado el turno correctamente:',
        data: { ...scheduleTwo, available: true },
        statusCode: HttpStatus.OK,
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { idSchedule: 1 },
      });
      expect(repository.update).toHaveBeenCalledWith(1, {
        available: true,
      });
    });

    it('should update the availability from false to true', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(schedule)
        .mockResolvedValueOnce({ ...scheduleTwo, available: true });

      jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

      const result = await service.updateAvailability(1);

      expect(result).toEqual({
        message: 'El turno ha sido reservado correctamente',
        data: { ...scheduleTwo, available: true },
        statusCode: HttpStatus.OK,
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { idSchedule: 1 },
      });
      expect(repository.update).toHaveBeenCalledWith(1, {
        available: true,
      });
    });
  });
});
