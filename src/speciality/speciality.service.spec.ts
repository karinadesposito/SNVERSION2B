import { Test, TestingModule } from '@nestjs/testing';
import { SpecialityService } from './speciality.service';
import { Speciality } from './entities/speciality.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SpecialityService', () => {
  let service: SpecialityService;
  let repository: Repository<Speciality>

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      getSpeciality: jest.fn(),
      findOneSpeciality: jest.fn(),
      updateSpeciality: jest.fn(),
      deleteSpeciality: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpecialityService,{ provide: getRepositoryToken(Speciality) , useValue: mockRepository }],
    }).compile();

    service = module.get<SpecialityService>(SpecialityService);
    repository = module.get<Repository<Speciality>>(getRepositoryToken(Speciality));  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
