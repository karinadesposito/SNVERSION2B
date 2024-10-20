import { Test, TestingModule } from '@nestjs/testing';
import { CoveragesService } from './coverage.service';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Coverage } from './entities/coverage.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateCoverageDto } from './dto/create-coverage.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateCoverageDto } from './dto/update-coverage.dto';

describe('CoverageService', () => {
  let service: CoveragesService;
  let repository: Repository<Coverage>;
  const createCov: CreateCoverageDto = {
    coverages: 'ioma',
  };
  const cov: Coverage = {
    id: 1,
    coverages: 'ioma',
    doctors: [],
  };
  const falseId = 123456;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoveragesService,
        {
          provide: getRepositoryToken(Coverage),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CoveragesService>(CoveragesService);
    repository = module.get<Repository<Coverage>>(getRepositoryToken(Coverage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should create a new coverage', async () => {
      const result: IResponse = {
        message: 'La obra social ha sido creado exitosamente',
        statusCode: HttpStatus.CREATED,
        data: cov,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(cov);
      jest.spyOn(repository, 'save').mockResolvedValue(cov);

      const response = await service.create(createCov);

      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { coverages: 'ioma' },
      });
      expect(repository.create).toHaveBeenCalledWith(createCov);
      expect(repository.save).toHaveBeenCalledWith(cov);
    });

    it('should return conflict if coverage already exists', async () => {
      const createCov: CreateCoverageDto = {
        coverages: 'ioma',
      };
      const existingCoverage = {
        id: 1,
        coverages: 'ioma',
        doctors: [],
      };
  
      jest.spyOn(repository, 'findOne').mockResolvedValue(existingCoverage);

      try {
        await service.create(existingCoverage);
      
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { coverages: 'ioma' }}); 
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe(`La obra social con nombre ${createCov.coverages} ya existe en la base de datos`);
          expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        }
      
    }); 
  
    it('should handle error during create', async () => {
      const createCov: CreateCoverageDto = {
        coverages: 'ioma',
      };
 
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Falló al buscar el coverage'));

      try {
        await service.create(createCov);
      } catch (error) {
        expect(error.message).toBe('Error del servidor');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      }
    });
  });

  describe('find', () => {
    it('should return a list of coverage', async () => {
      const coverages: Coverage[] = [{ ...cov }];
      const result: IResponse = {
        message: 'La lista de obras sociales está compuesta por:',
        data: coverages,
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(repository, 'find').mockResolvedValue(coverages);
      const response = await service.getCoverage();
      expect(response).toEqual(result);
      expect(repository.find).toHaveBeenCalled();
    });
    it('should return "No existen obras sociales registradas" when there are no coverages', async () => {
      
      jest
      .spyOn(repository, 'findOne')
      .mockRejectedValue(new Error('Falló al buscar el coverage'));
      try {
        await service.getCoverage();
      } catch (error) {
        expect(error.message).toBe('Error del servidor');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      } 
    });
    it('should handle error if list coverages not found', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(
          new Error(
            'Error del servidor',
          ),
        ); 
      try {
        await service.getCoverage();
      } catch (error) {
        expect(error.message).toBe(
          'Error del servidor', 
        );
      } 
    });   
  });

  describe('findOne', () => {
    it('should return a coverage ir found', async () => {
      const result: IResponse = {
        message: 'La obra social encontrada es:',
        data: cov,
        statusCode: HttpStatus.OK,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(cov);
      const response = await service.findOneCoverages(cov.id);
      if (
        'data' in response && 
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual('La obra social encontrada es:');
        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.data).toEqual(result.data);
      }
      expect(repository.findOne).toHaveBeenLastCalledWith({
        where: { id: cov.id },
      }); 
    });
    it('should return "La obra social no fue encontrada" when not found', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

     try{
       await service.findOneCoverages(falseId);
     } catch(error){
        expect(error.message).toEqual('La obra social no fue encontrada');
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT) 
    
      }
    });
    it('should handle error if coverage not found', async () => {
jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Error del servidor'));

      try {
        await service.findOneCoverages(falseId);
      } catch (error) {
        expect(error.message).toBe('Error del servidor');
      }
    });
  });

  describe('update', () => {
    it('should call service.updateCoverages', async () => {
      const updateCov: Partial<UpdateCoverageDto> = {
        coverages: 'IOMA',
      };
      const existingCoverage: Coverage = {
        id: 1,
        coverages: 'ioma',
        doctors: [],
      };
      const updatedCoverage: Coverage = {
        id: 1,
        coverages: 'IOMA',
        doctors: existingCoverage.doctors,
      };
      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };
      const result: IResponse = {
        message: 'Las modificaciones son las siguientes:',
        data: {
          coverages: 'IOMA',
          datosAnteriores: existingCoverage,
        },
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(existingCoverage); 
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult); 
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(updatedCoverage); 

      const response = await service.updateCoverages(cov.id, updateCov);

      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: cov.id } });
      expect(repository.update).toHaveBeenCalled();
    });

    it('should handle error during update', async () => {
 const updateCov: UpdateCoverageDto = {
        coverages: 'IOMA',
      };

      jest
        .spyOn(service, 'updateCoverages')
        .mockRejectedValue(new Error('Update failed'));

      try {
        await service.updateCoverages(falseId, updateCov);
      } catch (error) {
        expect(error.message).toBe('Update failed');
      }
    });
  });

  describe('delete', () => {
    it('should call delete', async () => {
        const result = {
        message: 'Se ha eliminado la obra social: ',
        statusCode: HttpStatus.MOVED_PERMANENTLY,
        data: cov.coverages,
      };
      const deleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(cov);
      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);
      const response = await service.deleteCoverage(cov.id);
      expect(response).toBeDefined(); 
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual(result.message);
        expect(response.data).toEqual(result.data);
        expect(response.statusCode).toEqual(result.statusCode);
      }
    });

    it('should handle deletion error', async () => {
     jest.spyOn(repository, 'findOne').mockResolvedValue(cov);
      jest
        .spyOn(repository, 'delete')
        .mockRejectedValue(new Error('Error del servidor'));

      try {
        await service.deleteCoverage(falseId);
      } catch (error) {
        expect(error.message).toBe('Error del servidor');
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual('Error del servidor');
        expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
    it('should handle coverage not found', async () => {
  jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.deleteCoverage(falseId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(
          'La cobertura no existe en la base de datos',
        );
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });
  });
});
 