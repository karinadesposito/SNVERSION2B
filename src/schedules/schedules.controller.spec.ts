import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedules.controller';
import { ScheduleService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpStatus } from '@nestjs/common';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { DeletionReason } from './enum/deleteSchedule.enum';

describe('ScheduleController', () => {
  let controller: ScheduleController;
  let service: ScheduleService;
  const newSchedule: CreateScheduleDto = {
    day: '2024-05-29',
    idDoctor: 1,
    start_Time: '08:30',
    end_Time: '16:30',
    interval: '30',
    available: true,
  };
  const id = 1;
  const schedule = {
    ...newSchedule,
  };

  beforeEach(async () => {
    const mockScheduleService = {
      createScheduleWithInterval: jest.fn(),
      getSchedules: jest.fn(),
      findOneSchedule: jest.fn(),
      updateSchedule: jest.fn(),
      deleteSchedule: jest.fn(),
      updateAvailability: jest.fn(),
      countScheduleByDoctor: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        {
          provide: ScheduleService,
          useValue: mockScheduleService,
        },
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createScheduleWithInterval', () => {
    it('should call scheduleService.createScheduleWithInterval and return the result', async () => {
      const result: IResponse = {
        message: 'La agenda ha sido creada exitosamente',
        statusCode: HttpStatus.CREATED,
      };

      jest
        .spyOn(service, 'createScheduleWithInterval')
        .mockResolvedValue(result);

      const response = await controller.create(newSchedule);
      expect(response).toEqual(result);
      expect(service.createScheduleWithInterval).toHaveBeenCalledWith(
        newSchedule,
      );
    });
  });

  describe('getSchedules', () => {
    it('should call service.getSchedules and return the result', async () => {
      const schedules = [schedule];
      const result: IResponse = {
        message: 'Agendas registradas:',
        statusCode: HttpStatus.FOUND,
        data: schedules,
      };

      jest.spyOn(service, 'getSchedules').mockResolvedValue(result);

      const response = await controller.findAllSchedules();
      expect(service.getSchedules).toHaveBeenCalled();
      expect(response).toEqual(result);
    });
  });

  describe('findOneSchedule', () => {
    it('should call service.findOneSchedule with correct params and return the result', async () => {
      const result: IResponse = {
        message: 'La agenda encontrada es:',
        statusCode: HttpStatus.FOUND,
        data: schedule,
      };

      jest.spyOn(service, 'findOneSchedule').mockResolvedValue(result);

      const response = await controller.findOneSchedule(id);
      expect(service.findOneSchedule).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
    });
  });

  describe('updateSchedule', () => {
    it('should call service.updateSchedule with correct params and return the result', async () => {    
      const updateScheduleDto: UpdateScheduleDto = {
        end_Time: '15:30',
      };
      jest.spyOn(service, 'updateSchedule').mockResolvedValue(schedule);

      const response = await controller.update(id, updateScheduleDto);
      expect(service.updateSchedule).toHaveBeenCalledWith(
        id,
        updateScheduleDto,
      );
      expect(response).toEqual(schedule);
    });
  });

  describe('deleteSchedule', () => {
    it('should call service.deleteSchedule with correct params and return the result', async () => {
        const deletionReason: DeletionReason = DeletionReason.other;
      const result = {
        message: 'Se ha eliminado la agenda con id:',
        data: id,
        statusCode: HttpStatus.MOVED_PERMANENTLY,
      };

      jest.spyOn(service, 'deleteSchedule').mockResolvedValue(result);

      const response = await controller.remove(id,deletionReason);
      expect(service.deleteSchedule).toHaveBeenCalledWith(id,deletionReason);
      expect(response).toEqual(result);
    });
  });

  describe('updateAvailability', () => {
    it('should call service.updateAvailability with correct params and return the result', async () => {
      const result: IResponse = {
        message: 'El turno ha sido reservado correctamente',
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(service, 'updateAvailability').mockResolvedValue(result);

      const response = await controller.updateAvailability(id);
      expect(service.updateAvailability).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
    });
  });

  describe('countScheduleByDoctor', () => {
    it('should call service.countScheduleByDoctor with correct params and return the result', async () => {
      const day = '2024-05-29';
      const idDoctor = 1;
      const schedules = [schedule];
      const result: IResponse = {
        message: `Los turnos del doctor ${idDoctor} son ${schedules.length} para el día ${day}`,
        statusCode: HttpStatus.OK,
        data: schedules,
      };

      jest.spyOn(service, 'countScheduleByDoctor').mockResolvedValue(result);

      const response = await controller.getCountTake({ idDoctor, day });
      expect(service.countScheduleByDoctor).toHaveBeenCalledWith(day, idDoctor);
      expect(response).toEqual(result);
    });
  });
});
