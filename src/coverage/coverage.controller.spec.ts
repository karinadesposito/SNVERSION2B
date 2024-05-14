import { Test, TestingModule } from '@nestjs/testing';
import { CoverageController } from './coverage.controller';
import { CoverageService } from './coverage.service';

describe('CoverageController', () => {
  let controller: CoverageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoverageController],
      providers: [CoverageService],
    }).compile();

    controller = module.get<CoverageController>(CoverageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
