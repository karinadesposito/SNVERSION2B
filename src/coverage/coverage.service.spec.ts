import { Test, TestingModule } from '@nestjs/testing';
import { CoveragesService } from './coverage.service';
import { Repository } from 'typeorm';
import { Coverage } from './entities/coverage.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CoverageService', () => {
  let service: CoveragesService;
  let repository: Repository<Coverage>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      getCoverage: jest.fn(),
      findOneCoverages: jest.fn(),
      updateCoverages: jest.fn(),
      deleteCoverage: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoveragesService,
        {
          provide: getRepositoryToken(Coverage),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CoveragesService>(CoveragesService);
    repository = module.get<Repository<Coverage>>(getRepositoryToken(Coverage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
