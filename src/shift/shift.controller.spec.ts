import { Test, TestingModule } from '@nestjs/testing';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpStatus } from '@nestjs/common';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { Shift } from './entities/shift.entity';

describe('ShiftController', () => {
  let controller: ShiftController;
  let service: ShiftService;
  const ids = { id: 1, idSchedule: 1, idPatient: 1 };
  const id = 1;

  beforeEach(async () => {
    const mockShiftService = {
      takeShift: jest.fn(),
      getShift: jest.fn(),
      findOneShift: jest.fn(),
      deleteShift: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftController],
      providers: [{ provide: ShiftService, useValue: mockShiftService }],
    }).compile();

    controller = module.get<ShiftController>(ShiftController);
    service = module.get<ShiftService>(ShiftService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('takeShift', () => {
    it('should call shiftService.takeShift and return the result', async () => {
      const newShift: CreateShiftDto = ids;
      const result: IResponse = {
        message: 'El turno se ha guardado',
        statusCode: HttpStatus.OK,
        data: newShift,
      };

      jest.spyOn(service, 'takeShift').mockResolvedValue(result);

      const response = await controller.takeShift(newShift);
      expect(response).toEqual(result);
      expect(service.takeShift).toHaveBeenCalledWith(
        newShift.idSchedule,
        newShift.idPatient,
      );
    });
  });

  describe('getShift', () => {
    it('should call service.getShift and return the result', async () => {
      const shifts: UpdateShiftDto[] = [ids];
      const result: IResponse = {
        message: 'Los turnos existentes son:',
        statusCode: HttpStatus.OK,
        data: shifts,
      };

      jest.spyOn(service, 'getShift').mockResolvedValue(result);

      const response = await controller.getShift();
      expect(response).toEqual(result);
      expect(service.getShift).toHaveBeenCalled();
    });
  });

  describe('findOneShift', () => {
    it('should call service.findOneShift with correct params', async () => {
      const shift: UpdateShiftDto = ids;
      const result: IResponse = {
        message: 'El turno hallado es:',
        statusCode: HttpStatus.OK,
        data: shift,
      };

      jest.spyOn(service, 'findOneShift').mockResolvedValue(result);

      const response = await controller.findOne(id);
      expect(service.findOneShift).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
    });
  });

  describe('deleteShift', () => {
    it('should call service.deleteShift with correct params', async () => {
      const shift: Shift = new Shift();
      const result: IResponse = {
        message: 'Se ha eliminado el turno:',
        statusCode: HttpStatus.OK,
        data: shift,
      };

      jest.spyOn(service, 'deleteShift').mockResolvedValue(result);

      const response = await controller.deleteShift(id);
      expect(service.deleteShift).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
    });
  });
});
