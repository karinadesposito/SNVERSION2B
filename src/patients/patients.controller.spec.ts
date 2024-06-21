import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpStatus } from '@nestjs/common';
import { UpdatePatientDto } from './dto/update-patient.dto';

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;
  const newPatient: CreatePatientDto = {
    fullName: 'Luis Garcia',
    mail: 'larcia@gmail.com',
    phone: '02281457898',
    dni: 'MP 75405',
    address: 'Sarmiento 224',
    birthday: new Date('1974-02-02'),
    coverage: {
      id: 1,
      coverages: 'ioma',
      doctors: [],
    },
  };

  beforeEach(async () => {
    const mockPatientsService = {
      create: jest.fn(),
      getPatients: jest.fn(),
      findOnePatient: jest.fn(),
      updatePatient: jest.fn(),
      deletePatient: jest.fn(),
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

  describe('create', () => {
    it('should call patientsService.create and return the result', async () => {
      const result: IResponse = {
        message: 'Patient created successfully',
        statusCode: HttpStatus.OK,
        data: newPatient,
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      const response = await controller.create(newPatient);
      expect(response).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(newPatient);
    });
  });
  describe('getPatients', () => {
    it('should call service.getPatients', async () => {
      const search = [newPatient];
      const result: IResponse = {
        message: 'Patients found successfully',
        statusCode: HttpStatus.OK,
        data: search,
      };
      jest.spyOn(service, 'getPatients').mockResolvedValue(result);
      const response = await controller.getPatients();
      expect(service.getPatients).toHaveBeenCalled();
      expect(response).not.toBeUndefined();
    });
  });
  describe('findOne', () => {
    it('should call service.findOnePatient with correct params', async () => {
      const id = 1;
      const result: IResponse = {
        message: 'Patient found successfully',
        statusCode: HttpStatus.OK,
        data: newPatient,
      };

      jest.spyOn(service, 'findOnePatient').mockResolvedValue(result);
      const response = await controller.findOne(id);
      expect(service.findOnePatient).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });

  describe('updatePatient', () => {
    it('should call service.updatePatient with correct params', async () => {
      const id = 1;
      const updatePatientDto: Partial<UpdatePatientDto> = {
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };

      const result = {
        id: '1',
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };
      jest.spyOn(service, 'updatePatient').mockResolvedValue(result);
      const response = await controller.updatePatient(updatePatientDto, id);
      expect(service.updatePatient).toHaveBeenCalledWith(id, updatePatientDto);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });

  describe('deletePatient', () => {
    it('should call service.deletePatient with correct params', async () => {
      const id = 1;
      const result = {
        message: 'Patient deleted successfully',
        statusCode: HttpStatus.OK,
      };
      jest.spyOn(service, 'deletePatient').mockResolvedValue(result);
      const response = await controller.deletePatient(id);
      expect(service.deletePatient).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });
});
