import { Test, TestingModule } from '@nestjs/testing';
import { CoveragesController } from './coverages.controller';
import { CoveragesService } from './coverages.service';

describe('CoveragesController', () => {
  let controller: CoveragesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoveragesController],
      providers: [CoveragesService],
    }).compile();

    controller = module.get<CoveragesController>(CoveragesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
