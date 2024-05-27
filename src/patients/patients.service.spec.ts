import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PatientsService', () => {
  let service: PatientsService;
  let repository: Repository<Patient>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      getPatients: jest.fn(),
      findOnePatient: jest.fn(),
      updatePatient: jest.fn(),
      deletePatient: jest.fn(),
      restorePatient: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    repository = module.get<Repository<Patient>>(getRepositoryToken(Patient));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
