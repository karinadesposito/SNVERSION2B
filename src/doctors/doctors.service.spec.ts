import { Test, TestingModule } from '@nestjs/testing';
import { DoctorsService } from './doctors.service';
import { Doctor } from './entities/doctor.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coverage } from '../coverage/entities/coverage.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Repository } from 'typeorm';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let repository: Repository<Doctor>;
  let repositoryCoverage: Repository<Coverage>;
  const doctorId = 1;
  const coverageId = [1];

  const dataDoc = {
    deletedAt: undefined,
    createAt: undefined,
    hasId: null,
    save: null,
    remove: null,
    softRemove: null,
    recover: null,
    reload: null,
  };
  const createDoc: CreateDoctorDto = {
    fullName: 'Juan Gomez',
    mail: 'docjgomez@gmail.com',
    phone: '02281457800',
    license: 'MP 75405',
    speciality: {
      id:1,
      name: 'Oftalmología',
      idDoctor:[]
    },
  };
  const doctor: Doctor = {
    ...createDoc,
    id: 1,
    coverages: [],
    speciality: {
      name: 'Oftalmología',
      id: 1,
      idDoctor: [],
    },
    schedule: [],
    ...dataDoc,
  };
  const doctors = [doctor];

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      find: jest.fn(),
      get: jest.fn(),
    };
    const mockCoverage = {
      addCoverageToDoctor: jest.fn(),
      removeCoverageFromDoctor: jest.fn(),
      findOne: jest.fn(),
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
    repositoryCoverage = module.get<Repository<Coverage>>(
      getRepositoryToken(Coverage),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new doctor', async () => {
      jest.spyOn(repository, 'create').mockReturnValue(doctor);
      jest.spyOn(repository, 'save').mockResolvedValue(doctor);

      const response = await service.create(createDoc);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual(
          'El doctor ha sido creado exitosamente',
        );
        expect(response.statusCode).toEqual(HttpStatus.CREATED);
        expect(response.data).toEqual(doctor);
      }
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { license: createDoc.license },
      });
      expect(repository.create).toHaveBeenCalledWith(createDoc);
      expect(repository.save).toHaveBeenCalledWith(doctor);
    });

    it('should return conflict response if doctor already exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(doctor);
      const response = await service.create(createDoc);
      if ('message' in response && 'statusCode' in response) {
        expect(response.message).toEqual(
          `El doctor con matricula ${createDoc.license} ya existe en la base de datos`,
        );
        expect(response.statusCode).toEqual(HttpStatus.CONFLICT);
      }
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { license: createDoc.license },
      });
    });

    it('should handle unexpected errors', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValueOnce(new Error('Database error'));
      try {
        await service.create(createDoc);
      } catch (error) {
        expect(error.message).toBe('No se pudo crear al doctor');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('addCoverageToDoctor', () => {
    it('should add the coverage to the doctor', async () => {
      const coverage: Coverage = {
        id: 1,
        coverages: '',
        doctors: [],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(doctor);
      jest.spyOn(repositoryCoverage, 'findOne').mockResolvedValue(coverage);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...doctor,
        id: 1,
        fullName: '',
        mail: '',
        phone: '',
        license: '',
        speciality: undefined,
        schedule: [],
        coverages: [coverage],
        ...dataDoc,
      });

      const response = await service.addCoverageToDoctor({
        doctorId,
        coverageId,
      });

      expect(response.coverages).toEqual([coverage]);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: doctorId },
        relations: ['coverages'],
      });
      expect(repositoryCoverage.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...doctor,
        coverages: [coverage],
      });
    });

    it('should throw NotFoundException if doctor is not found', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new NotFoundException());

      try {
        await service.addCoverageToDoctor({ doctorId, coverageId });
      } catch (error) {
        expect(error.message).toBe(
          `Doctor con ID ${doctorId} no fue encontrado`,
        );
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw NotFoundException if coverage is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(doctor);
      jest
        .spyOn(repositoryCoverage, 'findOne')
        .mockRejectedValue(new NotFoundException());

      try {
        await service.addCoverageToDoctor({ doctorId, coverageId });
      } catch (error) {
        expect(error.message).toBe(
          `Coverage con ID ${coverageId} no fue encontrado`,
        );
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('removeCoverageFromDoctor', () => {
    it('should remove the coverage from the doctor', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(doctor);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...doctor,
        fullName: '',
        mail: '',
        phone: '',
        license: '',
        speciality: undefined,
        schedule: [],
        coverages: [
          {
            id: 1,
            coverages: '',
            doctors: [],
          },
        ],
        ...dataDoc,
      });

      const response = await service.removeCoverageFromDoctor({
        doctorId,
        coverageId,
      });

      expect(response.coverages).toEqual([
        { id: 1, coverages: '', doctors: [] },
      ]);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: doctorId },
        relations: ['coverages'],
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...doctor,
      });
    });

    it('should throw NotFoundException if doctor is not found', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new NotFoundException());
      try {
        await service.removeCoverageFromDoctor({ doctorId, coverageId });
      } catch (error) {
        expect(error.message).toBe(
          `Doctor con ID ${doctorId} no fue encontrado`,
        );
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw NotFoundException if doctor has no coverages', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(doctor);

      try {
        await service.removeCoverageFromDoctor({ doctorId, coverageId });
      } catch (error) {
        expect(error.message).toBe(
          `El doctor con ID ${doctorId} no tiene coberturas`,
        );
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getDoctors', () => {
    it('should return a list of doctors', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue(doctors);

      const response = await service.getDoctors();
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual(
          'La lista de doctores está compuesta por:',
        );
        expect(response.statusCode).toEqual(HttpStatus.FOUND);
        expect(response.data).toEqual(doctors);
      }
    });

    it('should return no content message if no doctors are registered', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

      const response = await service.getDoctors();

      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual('No existen doctores registrados');
        expect(response.statusCode).toEqual(HttpStatus.NO_CONTENT);
        expect(response.data).toBeUndefined();
      }
    });

    it('should throw an internal server error if an exception occurs', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(new Error('Repository error'));

      try {
        await service.getDoctors();
      } catch (error) {
        expect(error.message).toBe(
          'Ha ocurrido un error.No se pudo traer la lista de doctores',
        );
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getDoctorsShiff', () => {
    it('should return not found if the doctor not found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const response = await service.getDoctorsShiff(doctorId);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual('No existe el doctor especificado');
        expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
        expect(response.data).toBeUndefined();
      }
    });

    it('should return NO_CONTENT when there are no available schedules', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue(doctors);

      const response = await service.getDoctorsShiff(doctorId);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual(
          'No hay turnos disponibles para el doctor especificado',
        );
        expect(response.statusCode).toEqual(HttpStatus.NO_CONTENT);
        expect(response.data).toBeUndefined();
      }
    });

    it('should return available schedules if found', async () => {
      const availableSchedules = [
        {
          idSchedule: 'sch1',
          day: '2024-06-18',
          idDoctor: 1,
          start_Time: '09:00',
          end_Time: '09:30',
          available: true,
          interval: '',
          idDoctors: new Doctor(),
          shiff: null,
        },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(doctors);

      const response = await service.getDoctorsShiff(doctorId);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual('Turnos disponibles del doctor:');
        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.data).toEqual(availableSchedules);
      }
    });

    it('should throw an internal server error if an exception occurs', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(new Error('Repository error'));

      try {
        await service.getDoctorsShiff(doctorId);
      } catch (error) {
        expect(error.message).toBe(
          'Ha ocurrido un error. No se pudo obtener la lista de doctores',
        );
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getDoctorsUnAvailable', () => {
    it('should return not found if the doctor not found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const response = await service.getDoctorsUnAvailable(doctorId);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual('No existe el doctor especificado');
        expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
        expect(response.data).toBeUndefined();
      }
    });

    it('should return NO_CONTENT when there are no available schedules', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue(doctors);

      const response = await service.getDoctorsUnAvailable(doctorId);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual(
          'No hay turnos disponibles para el doctor especificado',
        );
        expect(response.statusCode).toEqual(HttpStatus.NO_CONTENT);
        expect(response.data).toBeUndefined();
      }
    });

    it('should return unavailable schedules if found', async () => {
      const unavailableSchedules = [
        {
          idSchedule: 1,
          day: '2024-06-18',
          idDoctor: 1,
          start_Time: '09:00',
          end_Time: '09:30',
          available: false,
          interval: '',
          idDoctors: new Doctor(),
          shiff: null,
        },
        {
          idSchedule: 2,
          day: '2024-06-18',
          idDoctor: 1,
          start_Time: '09:00',
          end_Time: '09:30',
          available: false,
          interval: '',
          idDoctors: new Doctor(),
          shiff: null,
        },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(doctors);

      const response = await service.getDoctorsUnAvailable(doctorId);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual('Turnos ya asignados del doctor:');
        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.data).toEqual(unavailableSchedules);
      }
    });

    it('should throw an internal server error if an exception occurs', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(new Error('Repository error'));

      try {
        await service.getDoctorsUnAvailable(doctorId);
      } catch (error) {
        expect(error.message).toBe(
          'Ha ocurrido un error. No se pudo obtener la lista de doctores',
        );
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('findOneDoctor', () => {
    it('should return not found message if the doctor does not exist', async () => {
      const doctorFound = null;

      jest.spyOn(repository, 'findOne').mockResolvedValue(doctorFound);

      const response = await service.findOneDoctor(doctorId);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual('El doctor no fue encontrado');
        expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
        expect(response.data).toBeUndefined();
      }
    });

    it('should return a doctor if found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(doctor);
      const response = await service.findOneDoctor(doctorId);

      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual('El doctor encontrado es:');
        expect(response.statusCode).toEqual(HttpStatus.FOUND);
        expect(response.data).toEqual(doctor);
      }
    });

    it('should throw an internal server error if an exception occurs', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Repository error'));

      try {
        await service.findOneDoctor(doctorId);
      } catch (error) {
        expect(error.message).toBe('Ha ocurrido una falla en la busqueda');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
  describe('updateDoctor', () => {
    it('should call service.updateDoctor with correct params', async () => {
      const updateDoc: Partial<UpdateDoctorDto> = {
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };
      const result = {
        id: '1',
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };
      jest.spyOn(service, 'updateDoctor').mockResolvedValue(result);
      const response = await service.updateDoctor(doctorId, updateDoc);
      expect(service.updateDoctor).toHaveBeenCalledWith(doctorId, updateDoc);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });

    it('should update the data if the doctor exists', async () => {
      const updateData: Partial<UpdateDoctorDto> = {
        fullName: 'Juan Pablo Perez',
        mail: 'jpabloperez@gmail.com',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(doctor);
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      const response = await service.updateDoctor(doctorId, updateData);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: doctorId },
      });
      expect(repository.update).toHaveBeenCalledWith(doctorId, updateData);

      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual(
          'Las modificaciones son las siguientes: ',
        );
        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.data).toEqual({
          ...updateData,
          datosAnteriores: doctor,
        });
      }
    });

    it('should return not found message if the doctor does not exist', async () => {
      const updateDoc: Partial<UpdateDoctorDto> = {
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };

      jest.spyOn(repository, 'find').mockResolvedValue(null);

      const response = await service.updateDoctor(doctorId, updateDoc);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual(
          'El Doctor no existe en la base de datos',
        );
        expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
        expect(response.data).toBeUndefined();
      }
    });

    it('should handle error during update', async () => {
      const updateDoc: Partial<UpdateDoctorDto> = {
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };
      const errorMessage = 'No se pudo actualizar el doctor';

      jest
        .spyOn(repository, 'update')
        .mockRejectedValue(new Error('Repository error'));
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(
          new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
        );

      try {
        await service.updateDoctor(doctorId, updateDoc);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deleteDoctor', () => {
    it('should call service.deleteDoctor with correct params', async () => {
      const result = {
        message: 'Doctor deleted successfully',
        statusCode: HttpStatus.OK,
      };
      jest.spyOn(service, 'deleteDoctor').mockResolvedValue(result);
      const response = await service.deleteDoctor(doctorId);
      expect(service.deleteDoctor).toHaveBeenCalledWith(doctorId);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });

    it('should return not found message if the doctor does not exist', async () => {
      const result = null;
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      const response = await service.deleteDoctor(doctorId);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual(
          'El Doctor no existe en la base de datos',
        );
        expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
        expect(response.data).toBeUndefined();
      }
    });

    it('should delete the doctor successfully', async () => {
      const deleteResponse = {
        generatedMaps: [],
        raw: [],
        affected: 1,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(doctor);
      jest.spyOn(repository, 'softDelete').mockResolvedValue(deleteResponse);

      const response = await service.deleteDoctor(doctorId);
      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual(
          'Se ha eliminado el doctor con la matricula: ',
        );
        expect(response.statusCode).toEqual(HttpStatus.MOVED_PERMANENTLY);
        expect(response.data).toEqual(doctor.license);
      }
    });

    it('should throw an internal server error if an exception occurs', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Repository error'));

      try {
        await service.deleteDoctor(doctorId);
      } catch (error) {
        expect(error.message).toBe('No se pudo eliminar el doctor');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('findPatientsByDoctorId', () => {
    it('should call service.findPatientsByDoctorId with correct params', async () => {
      const result = {
        message: 'Los pacientes del médico son:',
        data: [],
        statusCode: HttpStatus.FOUND,
      };
      jest.spyOn(service, 'findPatientsByDoctorId').mockResolvedValue(result);
      const response = await service.findPatientsByDoctorId(doctorId);
      expect(service.findPatientsByDoctorId).toHaveBeenCalledWith(doctorId);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });

    it('should return not found message if the doctor does not exist', async () => {
      const result = null;
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      const response = await service.findPatientsByDoctorId(doctorId);

      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual(
          'El Doctor no existe en la base de datos',
        );
        expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should return not found message if the doctor has no associated patients', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(doctor);

      const response = await service.findPatientsByDoctorId(doctorId);

      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual(
          'No se encontraron pacientes asociados al médico',
        );
        expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
        expect(response.data).toBeUndefined();
      }
    });

    it('should return a list of patients if found', async () => {
      const patients = [{ id: '22be7c' }, { id: 'e951fe' }];
      const result = {
        message: 'Los pacientes del médico son:',
        data: patients,
        statusCode: HttpStatus.FOUND,
      };

      jest.spyOn(repository, 'find').mockRejectedValue(result);

      const response = await service.findPatientsByDoctorId(doctorId);

      if (
        'message' in response &&
        'statusCode' in response &&
        'data' in response
      ) {
        expect(response.message).toEqual('Los pacientes del médico son:');
        expect(response.statusCode).toEqual(HttpStatus.FOUND);
        expect(response.data).toEqual(patients);
      }
    });

    it('should throw an internal server error if an exception occurs', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Repository error'));

      try {
        await service.findPatientsByDoctorId(doctorId);
      } catch (error) {
        expect(error.message).toBe(
          'Ha ocurrido un error. No se pudo obtener la lista de pacientes',
        );
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('findBySpeciality', () => {
    it('should call service.findBySpeciality with correct params', async () => {
      const specialityName = 'Cardiología';
      const result = {
        message: 'Los doctores con dicha especialidad son:',
        data: [],
        statusCode: HttpStatus.FOUND,
      };
      jest.spyOn(service, 'findBySpeciality').mockResolvedValue(result);

      const response = await service.findBySpeciality(specialityName);
      expect(service.findBySpeciality).toHaveBeenCalledWith(specialityName);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });

  it('should return a list of doctors if doctors with speciality are found', async () => {
    const specialityName = 'Cardiología';

    jest.spyOn(repository, 'find').mockResolvedValueOnce(doctors);

    const response = await service.findBySpeciality(specialityName);

    if (
      'message' in response &&
      'statusCode' in response &&
      'data' in response
    ) {
      expect(response.message).toEqual(
        'Los doctores con dicha especialidad son:',
      );
      expect(response.statusCode).toEqual(HttpStatus.FOUND);
      expect(response.data).toEqual(doctors);
    }
  });

  it('should return not found message if not the speciality are found', async () => {
    const specialityName = 'cardiologia';
    jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

    const response = await service.findBySpeciality(specialityName);

    if (
      'message' in response &&
      'statusCode' in response &&
      'data' in response
    ) {
      expect(response.message).toEqual('La especialidad no fue encontrada');
      expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
      expect(response.data).toBeUndefined();
    }
  });

  it('should throw an internal server error if an exception occurs', async () => {
    const specialityName = 'Cardiología';
    const errorMessage = 'Ha ocurrido una falla en la busqueda';

    jest
      .spyOn(repository, 'find')
      .mockRejectedValueOnce(new Error(errorMessage));

    try {
      await service.findBySpeciality(specialityName);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('Ha ocurrido una falla en la busqueda');
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
});
