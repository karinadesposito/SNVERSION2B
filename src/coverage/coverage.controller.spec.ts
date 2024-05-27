import { Test, TestingModule } from '@nestjs/testing';
import { CoveragesController } from './coverage.controller';
import { CoveragesService } from './coverage.service';

describe('CoverageController', () => {
  let controller: CoveragesController;
  let service: CoveragesService;

  beforeEach(async () => {
    const mockCoveragesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoveragesController],
      providers: [
        {
          provide: CoveragesService,
          useValue: mockCoveragesService,
        },
      ],
    }).compile();

    controller = module.get<CoveragesController>(CoveragesController);
    service = module.get<CoveragesService>(CoveragesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
