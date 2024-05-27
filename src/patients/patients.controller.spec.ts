import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { AuthGuard } from '../auth/auth.guard';

jest.mock('config');

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;

  beforeEach(async () => {
    const mockPatientsService = {
      create: jest.fn(),
      getPatients: jest.fn(),
      findOne: jest.fn(),
      updatePatient: jest.fn(),
      deletePatient: jest.fn(),
      restorePatient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        { provide: PatientsService, useValue: mockPatientsService },
        JwtService,
        AuthGuard,
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});