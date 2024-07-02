import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patient.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdatePatientDto } from './dto/update-patient.dto';

describe('PatientsService', () => {
  let service: PatientsService;
  let repository: Repository<Patient>;

  const newPat: CreatePatientDto = {
    fullName: 'Luis Garcia',
    mail: 'larcia@gmail.com',
    phone: '02281457898',
    coverage: { 
      id: 1,
      coverages: 'ioma',
      doctors: [],
    },
    dni: '18485754',
    birthday: new Date('1974-12-02'),
    address: 'Sarmiento 224',
  };

  const patient: Patient = {
    ...newPat,
    shiffs: [],
    id: 1,
    createAt: null,
    hasId: null,
    save: null,
    remove: null,
    softRemove: null,
    recover: null,
    reload: null,
  };

  const falseId = 123456;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      get: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      restore: jest.fn(),
      save: jest.fn(),
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

  describe('create', () => {
    it('should create a new patient', async () => {
      const result: IResponse = {
        message: 'El paciente fue creado exitosamente',
        statusCode: HttpStatus.CREATED,
        data: patient,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(patient);
      jest.spyOn(repository, 'save').mockResolvedValue(patient);

      const response = await service.create(newPat);
      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { dni: newPat.dni },
      });
      expect(repository.create).toHaveBeenCalledWith(newPat);
      expect(repository.save).toHaveBeenCalledWith(patient);
    });
  });

  describe('find', () => {
    it('should return list of patients', async () => {
      const patients: Patient[] = [patient];
      const result: IResponse = {
        message: 'La lista de pacientes está compuesta por:',
        statusCode: HttpStatus.OK,
        data: patients,
      };

      jest.spyOn(repository, 'find').mockResolvedValue(patients);

      const response = await service.getPatients();
      expect(response).toEqual(result);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should return "No existen pacientes registrados"', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

      try {
        await service.getPatients();
      } catch (error) {
        expect(error.message).toEqual('No existen pacientes registrados');
        expect(error.status).toEqual(HttpStatus.CONFLICT);
      }
    });

    it('should handle error if list coverages not found', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(new Error('Error del servidor'));

      try {
        await service.getPatients();
      } catch (error) {
        expect(error.message).toBe('Error del servidor');
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('findOne', () => {
    it('should return a patient if found', async () => {
      const result: IResponse = {
        message: `El paciente encontrado con id ${patient.id} es:`,
        statusCode: HttpStatus.OK,
        data: patient,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(patient);

      const response = await service.findOnePatient(patient.id);
      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: patient.id },
      });
    });

    it('should handle error if patient not found', async () => {
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('Error del servidor'));

      try {
        await service.findOnePatient(falseId);
      } catch (error) {
        expect(error.message).toBe('Error del servidor');
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should return "Error del servidor" when not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.findOnePatient(patient.id);
      } catch (error) {
        expect(error.message).toEqual(`El paciente con id ${patient.id} no fue encontrado`);
        expect(error.status).toEqual(HttpStatus.CONFLICT);
      }
    });
  });

  describe('update', () => {
    it('should return patient updated', async () => {
      const updatePatient = {
        fullName: 'Juan Garcia',
        mail: 'larcia@gmail.com',
        phone: '02281457898',
        coverage: {
          id: 1,
          coverages: 'ioma',
          doctors: [],
        },
        dni: '18485754',
        birthday: new Date('1974-12-02'),
        address: 'Sarmiento 224',
        deletedAt: null,
        shiffs: [],
        id: 1,
        createAt: null,
        hasId: null,
        save: null,
        remove: null,
        softRemove: null,
        recover: null,
        reload: null,
      };

      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };

      const result: IResponse = {
        message: 'Las modificaciones son las siguientes: ',
        data: {
          ...updatePatient,
          datosAnteriores: patient,
        },
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(patient); // Simula encontrar el paciente existente
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult); // Simula la operación de actualización
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(updatePatient); // Simula encontrar el paciente actualizado

      const response = await service.updatePatient(patient.id, updatePatient);
      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: patient.id },
      });
      expect(repository.update).toHaveBeenCalledWith(patient.id, updatePatient);
    });

    it('should handle error during update', async () => {
      const updatePatient: Partial<UpdatePatientDto> = {
        fullName: 'Juan Garcia',
      };

      jest.spyOn(repository, 'update').mockRejectedValue(new Error('El paciente con ID 123456 no se ha encontrado'));

      try {
        await service.updatePatient(falseId, updatePatient);
      } catch (error) {
        expect(error.message).toBe(`El paciente con ID ${falseId} no se ha encontrado`);
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('delete', () => {
    it('should call service.deletePatient with correct params', async () => {
      const result = {
        message: 'Se ha eliminado el paciente: ',
        statusCode: HttpStatus.OK,
        data: patient,
      };

      const deleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(patient);
      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const response = await service.deletePatient(patient.id);
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
      expect(response).toBeDefined();
      expect(response.message).toEqual('Se ha eliminado el paciente: ');
      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.data).toEqual(result.data);}
    });

    it('should handle error during deletion', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(patient);
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error del servidor'));

      try {
        await service.deletePatient(falseId);
      } catch (error) {
        expect(error.message).toBe('Error del servidor');
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should handle patient not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.deletePatient(falseId);
      } catch (error) {
        expect(error.message).toEqual(`El paciente con id ${falseId} no ha sido encontrado: `);
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });
  });
});