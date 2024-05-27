import { Test, TestingModule } from '@nestjs/testing';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

describe('ShiftController', () => {
  let controller: ShiftController;
  let service: ShiftService;
  
  beforeEach(async () => {
    const mockShiftService = {
      takeShift: jest.fn(),
      getShift: jest.fn(),
      findOne: jest.fn(),
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
});
