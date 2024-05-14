import { Test, TestingModule } from '@nestjs/testing';
import { CoveragesService } from './coverages.service';

describe('CoveragesService', () => {
  let service: CoveragesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoveragesService],
    }).compile();

    service = module.get<CoveragesService>(CoveragesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
