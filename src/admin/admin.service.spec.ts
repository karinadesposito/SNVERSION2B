import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let repository: Repository<Admin>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    repository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});