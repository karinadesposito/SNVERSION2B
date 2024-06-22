import { Test, TestingModule } from '@nestjs/testing';
import { CoveragesController } from './coverage.controller';
import { CoveragesService } from './coverage.service';
import { CreateCoverageDto } from './dto/create-coverage.dto';
import { HttpStatus } from '@nestjs/common';
import { IResponse } from 'src/interface/IResponse';
import { UpdateCoverageDto } from './dto/update-coverage.dto';

describe('CoverageController', () => {
  let controller: CoveragesController;
  let service: CoveragesService;
  const newCoverage: CreateCoverageDto = { coverages: 'ioma' };
  const id = 1;
  beforeEach(async () => {
    const mockCoveragesService = {
      create: jest.fn(),
      getCoverage: jest.fn(),
      findOneCoverages: jest.fn(),
      updateCoverages: jest.fn(),
      deleteCoverage: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoveragesController],
      providers: [
        {
          provide: CoveragesService,
          useValue: mockCoveragesService,
        },
      ],
    }).compile();

    controller = module.get<CoveragesController>(CoveragesController);
    service = module.get<CoveragesService>(CoveragesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should call coverageService.create and return the result', async () => {
      const result: IResponse = {
        message: 'Coverages created successfully',
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      const response = await controller.create(newCoverage);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(service.create).toHaveBeenCalledWith(newCoverage);
    });
  });
  describe('findAll', () => {
    it('should call service.getCoverage', async () => {
      const result: IResponse = {
        message: 'Coverage found successfully',
        statusCode: HttpStatus.OK,
        data: newCoverage,
      };
      jest.spyOn(service, 'getCoverage').mockResolvedValue(result);
      const response = await controller.findAll();
      expect(service.getCoverage).toHaveBeenCalled();
      expect(response).not.toBeUndefined();
    });
  });
  describe('findOneCoverages', () => {
    it('should call service.findOneCoverages with correct params', async () => {
      const result: IResponse = {
        message: 'Coverages found successfully',
        statusCode: HttpStatus.OK,
        data: { newCoverage },
      };
      jest.spyOn(service, 'findOneCoverages').mockResolvedValue(result);
      const response = await controller.findOne(id);
      expect(service.findOneCoverages).toHaveBeenCalledWith(id);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });
  describe('updatecoverages', () => {
    it('should call service.updateCoverages with correct params', async () => {
      const updateCoverages: Partial<UpdateCoverageDto> = {
        coverages: 'IOMA',
      };
      const result = { id: 1, coverages: 'IOMA' };
      jest.spyOn(service, 'updateCoverages').mockResolvedValue(result);
      const response = await controller.update(id, updateCoverages);
      expect(service.updateCoverages).toHaveBeenCalledWith(id, updateCoverages);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });
  describe('deleteCoverage', () => {
    it('should call service.deleteCoverages with correct params', async () => {
      const result = {
        message: 'Doctor deleted successfully',
        statusCode: HttpStatus.OK,
      };
      jest.spyOn(service, 'deleteCoverage').mockResolvedValue(result);
      const response = await controller.remove(id);
      expect(service.deleteCoverage).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
    });
  });
});
