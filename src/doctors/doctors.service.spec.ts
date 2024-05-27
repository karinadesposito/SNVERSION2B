import { Test, TestingModule } from '@nestjs/testing';
import { DoctorsService } from './doctors.service';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coverage } from '../coverage/entities/coverage.entity';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let repository: Repository<Doctor>;
  let repositoryCoverage: Repository<Coverage>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      addCoverageToDoctor: jest.fn(),
      removeCoverageFromDoctor: jest.fn(),
      getDoctors: jest.fn(),
      getDoctorsShift: jest.fn(),
      getDoctorsUnAvailable: jest.fn(),
      findOneDoctor: jest.fn(),
      updateDoctor: jest.fn(),
      deleteDoctor: jest.fn(),
      restoreDoctor: jest.fn(),
      findPatientsByDoctorId: jest.fn(),
      findBySpeciality: jest.fn(),
    };
    const mockCoverage = {
      addCoverageToDoctor: jest.fn(),
      removeCoverageFromDoctor: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorsService,

        { provide: getRepositoryToken(Doctor), useValue: mockRepository },
        {
          provide: getRepositoryToken(Coverage),
          useValue: mockCoverage,
        },
      ],
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
    repository = module.get<Repository<Doctor>>(getRepositoryToken(Doctor));
    repositoryCoverage=module.get<Repository<Coverage>>(getRepositoryToken(Coverage))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
