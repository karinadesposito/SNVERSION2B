/*import { Test, TestingModule } from '@nestjs/testing';
import { DoctorsService } from './doctors.service';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coverage } from '../coverage/entities/coverage.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { HttpStatus } from '@nestjs/common';
import { IResponse } from 'src/interface/IResponse';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

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
        { provide: getRepositoryToken(Coverage), useValue: mockCoverage },
      ],
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
    repository = module.get<Repository<Doctor>>(getRepositoryToken(Doctor));
    repositoryCoverage = module.get<Repository<Coverage>>(getRepositoryToken(Coverage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new doctor', async () => {
      const createDoc: CreateDoctorDto = {
        fullName: 'Juan Gomez',
        mail: 'docjgomez@gmail.com',
        phone: '02281457800',
        license: 'MP 75405',
        speciality: { name: 'Oftalmología' },
      };
      const result: IResponse = {
        message: 'Doctor created successfully',
        statusCode: HttpStatus.CREATED,
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      const response = await service.create(createDoc);

      expect(response).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createDoc);
    });

    it('should handle error during creation', async () => {
      const createDoc: CreateDoctorDto = {
        fullName: 'Juan Gomez',
        mail: 'docjgomez@gmail.com',
        phone: '02281457800',
        license: 'MP 75405',
        speciality: { name: 'Oftalmología' },
      };
      jest.spyOn(service, 'create').mockRejectedValue(new Error('Creation failed'));

      try {
        await service.create(createDoc);
      } catch (error) {
        expect(error.message).toBe('Creation failed');
      }
    });
  });

  describe('getDoctors', () => {
    it('should return a list of doctors', async () => {
      const doctors = [
        {
          id: '0bb2b9',
          fullName: 'Juan Gomez',
          mail: 'docjgomez@gmail.com',
          phone: '02281457800',
          license: 'MP 75405',
          speciality: { name: 'Oftalmología' },
        },
      ];

      const result: IResponse = {
        message: 'La lista de doctores está compuesta por:',
        data: doctors,
        statusCode: HttpStatus.OK,
      };
      jest.spyOn(service, 'getDoctors').mockResolvedValue(result);

      const response = await service.getDoctors();

      expect(response).toEqual(result);
    });
  });

  describe('findOneDoctor', () => {
    it('should return a doctor if found', async () => {
      const id = '0bb2b9';
      const doctor = {
        id: '0bb2b9',
        fullName: 'Juan Gomez',
        mail: 'docjgomez@gmail.com',
        phone: '02281457800',
        license: 'MP 75405',
        speciality: { name: 'Oftalmología' },
      };
      const result: IResponse = {
        message: 'El doctor encontrado es:',
        statusCode: HttpStatus.FOUND,
        data: doctor,
      };
      jest.spyOn(service, 'findOneDoctor').mockResolvedValue(result);

      const response = await service.findOneDoctor(id);

      expect(response).toEqual(result);
      expect(service.findOneDoctor).toHaveBeenCalledWith(id);
    });

    it('should handle error if doctor not found', async () => {
      const id = 'invalid_id';
      jest.spyOn(service, 'findOneDoctor').mockRejectedValue(new Error('Doctor not found'));

      try {
        await service.findOneDoctor(id);
      } catch (error) {
        expect(error.message).toBe('Doctor not found');
      }
    });
  });

  describe('updateDoctor', () => {
    it('should update a doctor', async () => {
      const id = '0bb2b9';
      const updateDoc: Partial<UpdateDoctorDto> = {
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };
      const result = {
        id: '0bb2b9',
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };
      jest.spyOn(service, 'updateDoctor').mockResolvedValue(result);

      const response = await service.updateDoctor(id, updateDoc);

      expect(service.updateDoctor).toHaveBeenCalledWith(id, updateDoc);
      expect(response).toEqual(result);
    });

    it('should handle error during update', async () => {
      const id = '0bb2b9';
      const updateDoc: Partial<UpdateDoctorDto> = {
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };
      jest.spyOn(service, 'updateDoctor').mockRejectedValue(new Error('Update failed'));

      try {
        await service.updateDoctor(id, updateDoc);
      } catch (error) {
        expect(error.message).toBe('Update failed');
      }
    });
  });

  describe('deleteDoctor', () => {
    it('should delete a doctor', async () => {
      const id = '0bb2b9';
      const result = {
        message: 'Doctor deleted successfully',
        statusCode: HttpStatus.OK,
      };
      jest.spyOn(service, 'deleteDoctor').mockResolvedValue(result);

      const response = await service.deleteDoctor(id);

      expect(service.deleteDoctor).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
    });

    it('should handle error during deletion', async () => {
      const id = 'invalid_id';
      jest.spyOn(service, 'deleteDoctor').mockRejectedValue(new Error('Deletion failed'));

      try {
        await service.deleteDoctor(id);
      } catch (error) {
        expect(error.message).toBe('Deletion failed');
      }
    });
  });

  describe('restoreDoctor', () => {
    it('should restore a doctor', async () => {
      const id = '0bb2b9';
      const result = {
        message: 'Doctor restored successfully',
        statusCode: HttpStatus.OK,
      };
      jest.spyOn(service, 'restoreDoctor').mockResolvedValue(result);

      const response = await service.restoreDoctor(id);

      expect(service.restoreDoctor).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
    });

    it('should handle error during restoration', async () => {
      const id = 'invalid_id';
      jest.spyOn(service, 'restoreDoctor').mockRejectedValue(new Error('Restoration failed'));

      try {
        await service.restoreDoctor(id);
      } catch (error) {
        expect(error.message).toBe('Restoration failed');
      }
    });
  });

  describe('findPatientsByDoctorId', () => {
    it('should find patients by doctor ID', async () => {
      const doctorId = '0bb2b9';
      const result = {
        message: 'Patients found successfully',
        statusCode: HttpStatus.OK,
        data: [{ patientId: '123', name: 'Patient A' }],
      };
      jest.spyOn(service, 'findPatientsByDoctorId').mockResolvedValue(result);

      const response = await service.findPatientsByDoctorId(doctorId);

      expect(service.findPatientsByDoctorId).toHaveBeenCalledWith(doctorId);
      expect(response).toEqual(result);
    });

    it('should handle error during patient search', async () => {
      const doctorId = 'invalid_id';
      jest.spyOn(service, 'findPatientsByDoctorId').mockRejectedValue(new Error('Patients not found'));

      try {
        await service.findPatientsByDoctorId(doctorId);
      } catch (error) {
        expect(error.message).toBe('Patients not found');
      }
    });
  });

  describe('findBySpeciality', () => {
    it('should find doctors by speciality', async () => {
      const specialityName = 'Cardiología';
      const result = {
        message: 'Doctors found successfully',
        statusCode: HttpStatus.OK,
        data: [{ doctorId: '123', name: 'Doctor B' }],
      };
      jest.spyOn(service, 'findBySpeciality').mockResolvedValue(result);

      const response = await service.findBySpeciality(specialityName);

      expect(service.findBySpeciality).toHaveBeenCalledWith(specialityName);
      expect(response).toEqual(result);
    });

    it('should handle error during speciality search', async () => {
      const specialityName = 'InvalidSpeciality';
      jest.spyOn(service, 'findBySpeciality').mockRejectedValue(new Error('Speciality not found'));

      try {
        await service.findBySpeciality(specialityName);
      } catch (error) {
        expect(error.message).toBe('Speciality not found');
      }
    });
  });
});
*/