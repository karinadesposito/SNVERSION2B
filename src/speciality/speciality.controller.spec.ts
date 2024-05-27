import { Test, TestingModule } from '@nestjs/testing';
import { SpecialityController } from './speciality.controller';
import { SpecialityService } from './speciality.service';

describe('SpecialityController', () => {
  let controller: SpecialityController;
  let service: SpecialityService;

  beforeEach(async () => {
    const mockSpecialityService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecialityController],
      providers: [
        {
          provide: SpecialityService,
          useValue: mockSpecialityService,
        },
      ],
    }).compile();

    controller = module.get<SpecialityController>(SpecialityController);
    service = module.get<SpecialityService>(SpecialityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
