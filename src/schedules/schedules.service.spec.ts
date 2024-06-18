import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedules.service';
import { Schedule } from './entities/schedule.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

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
    idDoctor: '0bb2b9',
    start_Time: '14:30:00',
    end_Time: '15:00:00',
    available: true,
    interval: '30',
  };

  const schedule: Schedule = {
    ...createSch,
    idSchedule: '223f43',
    createId: jest.fn(),
    idDoctors: {
      id: '0bb2b9',
      fullName: 'Mariana Perez',
      mail: 'docmperez@saludnet.com',
      phone: '02281457423',
      license: 'MP 75405',
      speciality: {
        name: 'Cardiologia',
        id: '',
        createId: null,
        idDoctor: [],
      },
      deletedAt: undefined,
      restoredAt: undefined,
      schedule: [],
      coverages: [],
      createAt: undefined,
      createId: null,
      hasId: null,
      save: null,
      remove: null,
      softRemove: null,
      recover: null,
      reload: null,
    },
    shift: {
      id: '1bc32f',
      createId: jest.fn(),
      idPatient: {
        fullName: 'Luis Garcia',
        mail: 'larcia@gmail.com',
        phone: '02281457898',
        coverage: {
          id: '7b46c0',
          coverages: 'ioma',
          createId: jest.fn(),
          doctors: [],
        },
        dni: '18485754',
        birthday: new Date('1974-12-02'),
        address: 'Sarmiento 224',
        deletedAt: null,
        restoredAt: null,
        shifts: [],
        id: '5cec5f',
        createAt: null,
        createId: null,
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
    available:false,
    createId: jest.fn()
       };

  beforeEach(async () => {
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

      const response = await service.createScheduleWithInterval(createSch);
      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          day: createSch.day,
          idDoctor: createSch.idDoctor,
          start_Time: createSch.start_Time,
        },
      });
      expect(repository.save).toHaveBeenCalledWith([
        expect.objectContaining({
          day: schedule.day,
          idDoctor: schedule.idDoctor,
          start_Time: schedule.start_Time,
          end_Time: schedule.end_Time,
          available: schedule.available,
        }),
      ]);
    });

    it('should return conflict if schedules already exists', async () => {
      const result: IResponse = {
        message: `La agenda para este día y médico ya existe`,
        statusCode: HttpStatus.CONFLICT,
        data: schedule,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(schedule);

      const response = await service.createScheduleWithInterval(createSch);

      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          day: createSch.day,
          idDoctor: createSch.idDoctor,
          start_Time: createSch.start_Time,
        },
      });
    });
  });
  describe('find', () => {
    it('should return a list of schedules', async () => {
      const schedules = [{ ...schedule, createId: jest.fn() }];
      const result: IResponse = {
        message: 'Agendas registradas:',
        statusCode: HttpStatus.FOUND,
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

      const response = await service.getSchedules();
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual('No existen agendas registradas');
        expect(response.statusCode).toEqual(HttpStatus.NO_CONTENT);
        expect(response.data).toBeUndefined();
      }
    });
    it('should handle error if list coverages not found', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(
          new Error(
            'Ha ocurrido un error.No se pudo traer la lista de agendas',
          ),
        );
      try {
        await service.getSchedules();
      } catch (error) {
        expect(error.message).toBe(
          'Ha ocurrido un error.No se pudo traer la lista de agendas',
        );
      }
    });
  });
  describe('findOne', () => {
    it('should return a schedule if found', async () => {
      const id = '223f43';
      const schedules = { ...schedule, createId: jest.fn() };
      const result: IResponse = {
        message: 'La agenda encontrada es:',
        statusCode: HttpStatus.FOUND,
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
      const id = '123456';
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const response = await service.findOneSchedule(id);
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual('Esa agenda no existe');
        expect(response.statusCode).toEqual(HttpStatus.CONFLICT);
        expect(response.data).toBeUndefined();
      }
    });
    it('should handle error if coverage not found', async () => {
      const id = '123456';
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Ha ocurrido una falla en la busqueda'));

      try {
        await service.findOneSchedule(id);
      } catch (error) {
        expect(error.message).toBe('Ha ocurrido una falla en la busqueda');
      }
    });
  });

  describe('update', () => {
    it('should call service.updateSchedule whit correct params', async () => {
      const id = '223f43';
      const updateSch: UpdateScheduleDto = {
        available: true,
      };
      const existingSch: Schedule = { ...schedule, createId: jest.fn() };
      const updatedSch: Schedule = { ...schedule, createId: jest.fn() };

      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };
      const result: IResponse = {
        message: 'Las modificaciones son las siguientes: ',
        data: {
          available: true,
          datosAnteriores: existingSch,
        },
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(existingSch); // Simula encontrar el coverage existente
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult); // Simula la operación de actualización
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(updatedSch); // Simula encontrar el coverage actualizado

      const response = await service.updateSchedule(id, updateSch);

      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { idSchedule: id },
      });
      expect(repository.update).toHaveBeenCalled();
    });

    it('should handle error during update', async () => {
      const id = '123456';
      const updateSch: UpdateScheduleDto = {
        available: true,
      };

      jest
        .spyOn(service, 'updateSchedule')
        .mockRejectedValue(new Error('Update failed'));

      try {
        await service.updateSchedule(id, updateSch);
      } catch (error) {
        expect(error.message).toBe('Update failed');
      }
    });
  });

  describe('delete', () => {
    it('should call delete', async () => {
      const id = '223f43';
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
      const response = await service.deleteSchedule(id);
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
      const id = '123456';
      jest
        .spyOn(repository, 'delete')
        .mockRejectedValue(new Error('No se pudo eliminar la agenda'));

      try {
        await service.deleteSchedule(id);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual('No se pudo eliminar la agenda');
        expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
    it('should handle coverage not found', async () => {
      const id = '123456';
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.deleteSchedule(id);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual('La agenda no existe');
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });
  });
  describe('findScheduleByDay', () => {
    it('should return the found schedules of the day', async () => {
      const schedules: Schedule[] = [
        {
          ...schedule,
          createId: jest.fn(),
        },
      ];
      const result: IResponse = {
        message: 'Turnos tomamos en éste dia',
        statusCode: HttpStatus.OK,
        data: schedules,
      };
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
        relations: ['idDoctors', 'shift'],
      });
    });
  });
  describe('countScheduleByDoctor', () => {
    it('should return the count of schedules for the specified doctor and day', async () => {
      const schedules = [{ ...schedule, createId: jest.fn() }];
      const result: IResponse = {
        message: `Los turnos del doctor ${schedule.idDoctor} son ${schedules.length} para el día ${schedule.day}`,
        statusCode: HttpStatus.OK,
        data: schedules,
      };

      jest.spyOn(repository, 'find').mockResolvedValue(schedules);

      const response = await service.countScheduleByDoctor(
        schedule.day,
        schedule.idDoctor,
      );

      expect(response).toEqual(result);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          day: schedule.day,
          idDoctor: schedule.idDoctor,
          available: false,
        },
        relations: ['idDoctors', 'shift'],
      });
    });

    it('should throw HttpException when no schedules are found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      try {
        await service.countScheduleByDoctor(schedule.day, schedule.idDoctor);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          'No hay turnos disponibles para este día y médico',
        );
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          day: schedule.day,
          idDoctor: schedule.idDoctor,
          available: false,
        },
        relations: ['idDoctors', 'shift'],
      });
    });

    it('should throw HttpException when all schedules are available', async () => {
      const schedules = [{ ...schedule, createId: jest.fn() }];

      jest.spyOn(repository, 'find').mockResolvedValue(schedules);

      try {
        await service.countScheduleByDoctor(schedule.day, schedule.idDoctor);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          'No hay turnos disponibles para este día y médico',
        );
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          day: schedule.day,
          idDoctor: schedule.idDoctor,
          available: false,
        },
        relations: ['idDoctors', 'shift'],
      });
    });
  });
  describe('updateAvailability', () => {
    it('should throw an error if the schedule does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      try {
        await service.updateAvailability('non-existent-id');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('El turno no existe');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { idSchedule: 'non-existent-id' },
      });
    });

    it('should update the availability from true to false', async () => {
  
      jest.spyOn(repository,'findOne').mockResolvedValueOnce(scheduleTwo).mockResolvedValueOnce({ ...scheduleTwo, available: true });

      jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

      const result = await service.updateAvailability('existing-id');
 
      expect(result).toEqual({
        message: 'Se ha cancelado el turno correctamente',
        data: { ...scheduleTwo, available: true },
        statusCode: HttpStatus.OK,
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { idSchedule: 'existing-id' },
      });
      expect(repository.update).toHaveBeenCalledWith('existing-id', {
        available: true, 
      });
    });

    it('should update the availability from false to true', async () => {
      
      jest.spyOn(repository,'findOne').mockResolvedValueOnce(schedule).mockResolvedValueOnce({ ...scheduleTwo, available: true});

      jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

      const result = await service.updateAvailability('existing-id');

      expect(result).toEqual({
        message: 'El turno ha sido reservado correctamente',
        data: { ...scheduleTwo, available: true },
        statusCode: HttpStatus.OK, 
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { idSchedule: 'existing-id' },
      });
      expect(repository.update).toHaveBeenCalledWith('existing-id', {
        available: true,
      });
    });
  });
});
