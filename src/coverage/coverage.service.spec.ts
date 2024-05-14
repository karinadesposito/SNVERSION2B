import { Test, TestingModule } from '@nestjs/testing';
import { CoverageService } from './coverage.service';

describe('CoverageService', () => {
  let service: CoverageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoverageService],
    }).compile();

    service = module.get<CoverageService>(CoverageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
