import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpStatus } from '@nestjs/common';
import { UpdatePatientDto } from './dto/update-patient.dto';

jest.mock('config');

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;

  beforeEach(async () => {
    const mockPatientsService = {
      create: jest.fn(),
      getPatients: jest.fn(),
      findOnePatient: jest.fn(),
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

  /*describe('create', () => {
    it('should call patientsService.create and return the result', async () => {
      const newPatient: CreatePatientDto = {
        fullName: 'Luis Garcia',
        mail: 'larcia@gmail.com',
        phone: '02281457898',
        dni: 'MP 75405',
        address: 'Sarmiento 224',
        birthday: new Date("1974-02-02"),
        coverage: {
          coverages: 'ioma',
          doctors: [
            {
              fullName: 'Juan Gomez',
              mail: 'docjgomez@gmail.com',
              phone: '02281457800',
              license: 'MP 75405',
              speciality:{
                name: 'Oftalmología',
              },
            },
          ],
        },
      };

      const result: IResponse = {
        message: 'Patient created successfully',
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      const response = await controller.create(newPatient);
      expect(response).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(newPatient);
    });
  });*/
  describe('getPatients', () => {
    it('should call service.getPatients', async () => {
      const search = [
        { 
        id: "a501bd",
        fullName: "Luis Molina",
        mail: "lmolina@gmail.com",
        phone: "02281457798",
        "createAt": "2024-05-15T09:56:37.000Z",
        dni: "18485744",
        address: "San Martin 224",
        birthday: "1974-02-02",
        coverage: {
          id: "7b46c0",
          coverages: "ioma"
        }}
      ];
      const result: IResponse = {
        message: 'Patients found successfully',
        statusCode: HttpStatus.OK,
        data: search
      };
      jest.spyOn(service, 'getPatients').mockResolvedValue(result);
      const response = await controller.getPatients();
      expect(service.getPatients).toHaveBeenCalled();
      expect(response).not.toBeUndefined();
    });
  });
  describe('findOne', () => {
    it('should call service.findOnePatient with correct params', async () => {
      const id = 'a501bd';
      const patient = {
        id: "a501bd",
        fullName: "Luis Molina",
        mail: "lmolina@gmail.com",
        phone: "02281457798",
        createAt: new Date("2024-05-15T09:56:37.000Z"),
        dni: "18485744",
        address: "San Martin 224",
        birthday: new Date("1974-02-02"),
        deletedAt: null,
        restoredAt: new Date("2024-05-15T09:56:37.880Z"),
        coverage: {
          id: "7b46c0",
          coverages: "ioma",
        }
      };

      const result: IResponse = {
        message: 'Patient found successfully',
        statusCode: HttpStatus.OK,
        data: patient
      };

      jest.spyOn(service, 'findOnePatient').mockResolvedValue(result);
      const response = await controller.findOne(id);
      expect(service.findOnePatient).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });

  /*describe('updatePatient', () => {
    it('should call service.updatePatient with correct params', async () => {
      const id = 'a501bd';
      const updatePatientDto: Partial<UpdatePatientDto> = {
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };
  
      const patient = {
        id: 'a501bd',
        fullName: 'Luis Molina',
        mail: 'lmolina@gmail.com',
        phone: '02281457798',
        createAt: new Date('2024-05-15T09:56:37.000Z'),
        dni: '18485744',
        address: 'San Martin 224',
        birthday: new Date('1974-02-02'),
        coverage: {
          id: '7b46c0',
          coverages: 'ioma',
        },
        deletedAt: null,
        restoredAt: null,
        shifts: [],
      };
  
      const result = {
        message: 'Las modificaciones son las siguientes: ',
        data: {
          ...updatePatientDto,
          datosAnteriores: patient,
        },
        statusCode: HttpStatus.OK,
      };
  
      jest.spyOn(service, 'updatePatient').mockResolvedValue(result);
  
      const response = await controller.updatePatient(updatePatientDto, id);
      expect(service.updatePatient).toHaveBeenCalledWith(id, updatePatientDto);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });*/
  describe('deletePatient', () => {
    it('should call service.deletePatient with correct params', async () => {
      const id = 'a501bd';
      const result = { message: 'Patient deleted successfully', statusCode:HttpStatus.OK };
      jest.spyOn(service, 'deletePatient').mockResolvedValue(result);
      const response = await controller.deletePatient(id);
      expect(service.deletePatient).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });
  describe('restorePatient', () => {
    it('should call service.restorePatient with correct params', async () => {
      const id = 'a501bd';
      const result = { message: 'Patient restored successfully', statusCode:HttpStatus.OK  };
      jest.spyOn(service, 'restorePatient').mockResolvedValue(result);
      const response = await controller.restorePatient(id);
      expect(service.restorePatient).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });


});
