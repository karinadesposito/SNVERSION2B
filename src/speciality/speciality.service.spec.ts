import { Test, TestingModule } from '@nestjs/testing';
import { SpecialityService } from './speciality.service';
import { Speciality } from './entities/speciality.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { IResponse } from 'src/interface/IResponse';

describe('SpecialityService', () => {
  let service: SpecialityService;
  let repository: Repository<Speciality>;
  const mockRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    save: jest.fn(),
  };
  const createSpe: CreateSpecialityDto = {
    name: 'Odontología',
  };
  const speciality: Speciality = {
    name: 'Odontología',
    id: 1,
    idDoctor: [],
  };
  const falseId = 123456;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecialityService,
        { provide: getRepositoryToken(Speciality), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<SpecialityService>(SpecialityService);
    repository = module.get<Repository<Speciality>>(
      getRepositoryToken(Speciality),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should create a new speciality', async () => {
      const result: IResponse = {
        message: `La especialidad ha sido creado exitosamente`,
        statusCode: HttpStatus.CREATED,
        data: speciality,
      };

      jest.spyOn(repository, 'create').mockReturnValue(speciality);
      jest.spyOn(repository, 'save').mockResolvedValue(speciality);

      const response = await service.create(createSpe);

      expect(response).toEqual(result);
      expect(repository.create).toHaveBeenCalledWith(createSpe);
      expect(repository.save).toHaveBeenCalledWith(speciality);
    });
    it('should return speciality is it exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(speciality);
      try {
        await service.create(createSpe);
      } catch (error) {
        expect(error.message).toBe(
          `La especialidad con nombre ${speciality.name} ya existe en la base de datos`,
        );
        expect(error.statusCode).toEqual(HttpStatus.CONFLICT);
      }
    });

    it('should handle errors when creating a speciality', async () => {
      jest.spyOn(repository, 'create').mockImplementation(() => {
        throw new Error('No se pudo crear la especialidad');
      });

      try {
        await service.create(createSpe);
      } catch (error) {
        expect(error.message).toBe('No se pudo crear la especialidad');
      }
    });
  });
  describe('find', () => {
    it('should return a list of speciality', async () => {
      const specialities = [
        {
          ...speciality,
        },
      ];
      const result: IResponse = {
        message: 'La lista de especialidades está compuesta por:',
        statusCode: HttpStatus.OK,
        data: specialities,
      };
      jest.spyOn(repository, 'find').mockResolvedValue([speciality]);

      const response = await service.getSpeciality();
      expect(response).toEqual(result);
      expect(repository.find).toHaveBeenCalled();
    });
  });
  it('should return "No existen especialidades registradas"when there are no schedules', async () => {
    jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

    const response = await service.getSpeciality();
    if (
      'data' in response &&
      'statusCode' in response &&
      'message' in response
    ) {
      expect(response.message).toEqual('No existen especialidades registradas');
      expect(response.statusCode).toEqual(HttpStatus.NO_CONTENT);
      expect(response.data).toBeUndefined();
    }
  });
  it('should handle error if list specialities not found', async () => {
    jest
      .spyOn(repository, 'find')
      .mockRejectedValue(
        new Error(
          'Ha ocurrido un error.No se pudo traer la lista de especialidades',
        ),
      );
    try {
      await service.getSpeciality();
    } catch (error) {
      expect(error.message).toBe(
        'Ha ocurrido un error.No se pudo traer la lista de especialidades',
      );
    }
  });
  describe('findOneSpeciality', () => {
    it('should call find one speciality with correct params', async () => {
      const result: IResponse = {
        message: 'La especialidad encontrada es:',
        statusCode: HttpStatus.FOUND,
        data: speciality,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(speciality);

      const response = await service.findOneSpeciality(speciality.id);
      expect(response).toEqual(result);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: speciality.id },
      });
    });
    it('should handle error if speciality not found', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Ha ocurrido una falla en la busqueda'));
      try {
        await service.findOneSpeciality(falseId);
      } catch (error) {
        expect(error.message).toBe('Ha ocurrido una falla en la busqueda');
      }
    });
  });
  it('should return "La especialidad no fue encontrada" when not found', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

    const response = await service.findOneSpeciality(falseId);
    if (
      'data' in response &&
      'statusCode' in response &&
      'message' in response
    ) {
      expect(response.message).toEqual('La especialidad no fue encontrada');
      expect(response.statusCode).toEqual(HttpStatus.CONFLICT);
      expect(response.data).toBeUndefined();
    }
  });
  describe('update', () => {
    it('should call update speciality with correct params', async () => {
      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };
      const existingSpe: Speciality = { ...speciality };
      const updatedSpe: Speciality = { ...speciality };
      const result: IResponse = {
        message: 'Las modificaciones son las siguientes: ',
        statusCode: HttpStatus.OK,
        data: {
          datosAnteriores: existingSpe,
          id: updatedSpe.id,
          idDoctor: updatedSpe.idDoctor,
          name: updatedSpe.name,
        },
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(existingSpe); // Simula encontrar el coverage existente
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult); // Simula la operación de actualización
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(updatedSpe);
      const response = await service.updateSpeciality(
        speciality.id,
        speciality,
      );
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual(result.message);
        expect(response.statusCode).toEqual(result.statusCode);
      }
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: speciality.id },
      });
      expect(repository.update).toHaveBeenCalledWith(speciality.id, speciality);
    });
    it('should handle error during update', async () => {
      jest
        .spyOn(repository, 'update')
        .mockRejectedValue(new Error('No se pudo actualizar la especialidad'));
      try {
        await service.updateSpeciality(speciality.id, speciality);
      } catch (error) {
        expect(error.message).toBe('No se pudo actualizar la especialidad');
      }
    });
  });
  describe('delete', () => {
    it('should call delete speciality with correct params', async () => {
      const result: IResponse = {
        message: 'Se ha eliminado la especialidad: ',
        statusCode: HttpStatus.OK,
        data: speciality.name,
      };
      const deleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };
      jest.spyOn(service, 'deleteSpeciality').mockResolvedValue(result);
      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const response = await service.deleteSpeciality(speciality.id);
      expect(response).toBeDefined();
      if (
        'data' in response &&
        'statusCode' in response &&
        'message' in response
      ) {
        expect(response.message).toEqual('Se ha eliminado la especialidad: ');
        expect(response.data).toEqual(result.data);
        expect(response.statusCode).toEqual(HttpStatus.OK);
      }
    });
    it('should handle non-existing speciality', async () => {
      jest.spyOn(repository, 'findOne').mockReturnValue(null);

      try {
        await service.deleteSpeciality(falseId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(
          'La especialidad no existe en la base de datos',
        );
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
      }
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: falseId },
      });
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should handle error during deletion', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(speciality);
      jest
        .spyOn(repository, 'delete')
        .mockRejectedValue(new Error('No se pudo eliminar la especialidad'));
      try {
        await service.deleteSpeciality(speciality.id);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual('No se pudo eliminar la especialidad');
        expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: speciality.id },
      });
      expect(repository.delete).toHaveBeenCalledWith({ id: speciality.id });
    });
  });
});
