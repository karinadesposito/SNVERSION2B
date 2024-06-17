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
      id: '7b46c0',
      coverages: 'ioma',
      createId: jest.fn(),
      doctors: [],
    },
    dni: '18485754',
    birthday: new Date('1974-12-02'),
    address: 'Sarmiento 224',
  };

  const patient: Patient = {
    ...newPat,
    deletedAt: null,
    restoredAt: null,
    shifts: [],
    id: '5cec5f',
    createAt: null,
    createId: null,
    hasId: null,
    save: null,
    remove: null,
    softRemove: null,
    recover: null,
    reload: null,
  };
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

      const response = await service.getPatients();
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual('No existen pacientes registradas');
        expect(response.statusCode).toEqual(HttpStatus.NO_CONTENT);
        expect(response.data).toBeUndefined();
      }
    });
    it('should handle error if list coverages not found', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(
          new Error(
            'Ha ocurrido un error.No se pudo traer la lista de obras sociales',
          ),
        );
      try {
        await service.getPatients();
      } catch (error) {
        expect(error.message).toBe(
          'Ha ocurrido un error.No se pudo traer la lista de pacientes',
        );
      }
    });
  });
  describe('findOne', () => {
    it('should return a patient if found', async () => {
      const id = '5cec5f';
      const result: IResponse = {
        message: 'El paciente encontrado es:',
        statusCode: HttpStatus.OK,
        data: patient,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(patient);

      const response = await service.findOnePatient(id);
      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalled();
    });
    it('should handle error if doctor not found', async () => {
      const id = '123456';
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Ha ocurrido una falla en la busqueda'));

      try {
        await service.findOnePatient(id);
      } catch (error) {
        expect(error.message).toBe('Ha ocurrido una falla en la busqueda');
      }
    });
    it('should return "El paciente no fue encontrado" when not found', async () => {
      const id = '123456';
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const response = await service.findOnePatient(id);
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual('El paciente no fue encontrado');
        expect(response.statusCode).toEqual(HttpStatus.CONFLICT);
        expect(response.data).toBeUndefined();
      }
    });  
  });
  describe('update', () => {
    it('should return patient updated', async () => {
      const id = '5cec5f';
      const updatePatient = {
        fullName: 'Juan Garcia',
        mail: 'larcia@gmail.com',
        phone: '02281457898',
        coverage: {
          id: '7b46c0',
          coverages: 'ioma',
          createId: jest.fn(),
          doctors: [],
        },
        dni: '18485754',
        birthday: new Date('1974-12-02'),
        address: 'Sarmiento 224',
        deletedAt: null,
        restoredAt: null,
        shifts: [],
        id: '5cec5f',
        createAt: null,
        createId: null,
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

      const response = await service.updatePatient(id, updatePatient);

      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(repository.update).toHaveBeenCalledWith(id, updatePatient);
    });

    it('should handle error during update', async () => {
      const id = '123456';
      const updatePatient: Partial<UpdatePatientDto> = { 
        fullName: 'Juan Garcia',
      };

      jest
        .spyOn(service, 'updatePatient')
        .mockRejectedValue(new Error('Update failed'));

      try {
        await service.updatePatient(id, updatePatient);
      } catch (error) {
        expect(error.message).toBe('Update failed');
      }
    });
  });

  describe('delete', () => {
    it('should call service.deletePatient whit correct params', async () => {
      const id = '5cec5f';
      const result = {
        message: 'Se ha eliminado el paciente: ',
        statusCode: HttpStatus.OK,
        data:
          patient
       };
      const deleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(patient);
      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const response = await service.deletePatient(id);
      expect(response).toBeDefined(); // Verificamos que la respuesta no sea nula
      if ('statusCode' in response && 'message' in response && 'data' in response) {
        expect(response.message).toEqual('Se ha eliminado el paciente: ');
        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.data).toEqual(result.data);
      }
    });
  });
  it('should handle error during deletion', async () => {
    const id = '123456';
    jest.spyOn(repository, 'findOne').mockResolvedValue(patient);
    jest
      .spyOn(repository, 'delete')
      .mockRejectedValue(new Error('No se pudo eliminar el paciente'));

    try {
      await service.deletePatient(id);
    } catch (error) {
      expect(error.message).toBe('No se pudo eliminar el paciente');
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('No se pudo eliminar el paciente');
      expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
  it('should handle coverage not found', async () => {
    const id = '123456';
    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
    const response = await service.deletePatient(id);
    if ('statusCode' in response && 'message' in response) {
      expect(response.message).toEqual('El paciente no ha sido encontrado: ');
      expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
    }
  });
   });