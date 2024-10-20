import { Test, TestingModule } from '@nestjs/testing';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { AddCoverageToDoctorDto } from '../coverage/dto/add-coverage.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { IResponse } from '../interface/IResponse';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('DoctorsController', () => {
  let controller: DoctorsController;
  let service: DoctorsService;
  const newDoctor: CreateDoctorDto = {
    fullName: 'Juan Gomez',
    mail: 'docjgomez@gmail.com',
    phone: '02281457800',
    license: 'MP 75405',
    speciality: {id:1,idDoctor:[], name: 'Oftalmología' },
  };
  const id = 1;
  const search = [newDoctor];
  beforeEach(async () => {
    const mockDoctorsService = {
      create: jest.fn(),
      getDoctors: jest.fn(),
      getDoctorsShiff: jest.fn(),
      getDoctorsUnAvailable: jest.fn(),
      findOneDoctor: jest.fn(),
      updateDoctor: jest.fn(),
      deleteDoctor: jest.fn(),
      addCoverageToDoctor: jest.fn(),
      removeCoverageFromDoctor: jest.fn(),
      findPatientsByDoctorId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorsController],
      providers: [
        {
          provide: DoctorsService,
          useValue: mockDoctorsService,
        },
      ],
    }).compile();

    controller = module.get<DoctorsController>(DoctorsController);
    service = module.get<DoctorsService>(DoctorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call doctorsService.create and return the result', async () => {
      const result: IResponse = {
        message: 'Doctor created successfully',
        statusCode: HttpStatus.CREATED,
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      const response = await controller.create(newDoctor);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(service.create).toHaveBeenCalledWith(newDoctor);
    });

    it('should throw an exception if doctorsService.create fails', async () => {
      const error = new HttpException('Error creating doctor', 500);

      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(controller.create(newDoctor)).rejects.toThrow(error);
      expect(service.create).toHaveBeenCalledWith(newDoctor);
    });
  });

  describe('Doctors', () => {
    it('should call service.getDoctors', async () => {
      const result: IResponse = {
        message: 'Doctor found successfully',
        statusCode: HttpStatus.OK,
        data: search,
      };
      jest.spyOn(service, 'getDoctors').mockResolvedValue(result);
      const response = await controller.Doctors();
      expect(service.getDoctors).toHaveBeenCalled();
      expect(response).not.toBeUndefined();
    });
  });

  describe('DoctorsTwo', () => {
    it('should call service.getDoctorsShiff', async () => {
      const result: IResponse = {
        message: 'Doctor created successfully',
        statusCode: HttpStatus.OK,
        data: search,
      };
      jest.spyOn(service, 'getDoctorsShiff').mockResolvedValue(result);
      const response = await controller.DoctorsTwo(id);
      expect(service.getDoctorsShiff).toHaveBeenCalled();
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });

  describe('findOneDoctor', () => {
    it('should call service.findOneDoctor with correct params', async () => {
      const result: IResponse = {
        message: 'Doctor found successfully',
        statusCode: HttpStatus.OK,
        data: search,
      };
      jest.spyOn(service, 'findOneDoctor').mockResolvedValue(result);
      const response = await controller.findOneDoctor(id);
      expect(service.findOneDoctor).toHaveBeenCalledWith(id);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });

  describe('updateDoctor', () => {
    it('should call service.updateDoctor with correct params', async () => {
      const updateDoctorDto: Partial<UpdateDoctorDto> = {
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };
      const result = {
        id: '1',
        fullName: 'Juan Perez',
        mail: 'jperez@gmail.com',
      };
      jest.spyOn(service, 'updateDoctor').mockResolvedValue(result);
      const response = await controller.updateDoctor(updateDoctorDto, id);
      expect(service.updateDoctor).toHaveBeenCalledWith(id, updateDoctorDto);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });

  describe('deleteDoctor', () => {
    it('should call service.deleteDoctor with correct params', async () => {
      const result = {
        message: 'Doctor deleted successfully',
        statusCode: HttpStatus.OK,
      };
      jest.spyOn(service, 'deleteDoctor').mockResolvedValue(result);
      const response = await controller.deleteDoctor(id);
      expect(service.deleteDoctor).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });
  describe('addCoverageToDoctor', () => {
    it('should call service.addCoverageToDoctor with correct params', async () => {
      const addCoverageToDoctorDto: AddCoverageToDoctorDto = {
        doctorId: 1,
        coverageId: [1],
      };

      const response = await controller.addCoverageToDoctor(
        addCoverageToDoctorDto,
      );
      expect(service.addCoverageToDoctor).toHaveBeenCalledWith(
        addCoverageToDoctorDto,
      );
      expect(response).not.toBeNull();
    });
  });

  describe('removeCoverageFromDoctor', () => {
    it('should call service.removeCoverageFromDoctor with correct params', async () => {
      const removeCoverageFromDoctorDto: AddCoverageToDoctorDto = {
        doctorId: 1,
        coverageId: [1],
      };
      const response = await controller.removeCoverageFromDoctor(
        removeCoverageFromDoctorDto,
      );
      expect(service.removeCoverageFromDoctor).toHaveBeenCalledWith(
        removeCoverageFromDoctorDto,
      );
      expect(response).not.toBeNull();
    });
  });

  describe('findPatientsByDoctorId', () => {
    it('should call service.findPatientsByDoctorId with correct params', async () => {
      const result = {
        message: 'Coverage added successfully',
        statusCode: HttpStatus.OK,
      };
      jest.spyOn(service, 'findPatientsByDoctorId').mockResolvedValue(result);
      const response = await controller.getPatientsByDoctorId(id);
      expect(service.findPatientsByDoctorId).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });

});
