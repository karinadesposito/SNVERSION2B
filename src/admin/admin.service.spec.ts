import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AdminService', () => {
  let service: AdminService;
  let repository: Repository<Admin>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    repository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  describe('create', () => {
    it('should create a new admin', async () => {
      const createAdmin: CreateAdminDto = {
        username: 'Admin',
        email: 'admin@saludnet.com',
        password: 'admin1234',
      };

      const hashedPassword = 'hashedPassword';

      const result: IResponse = {
        message: 'El administrador ha sido creado exitosamente',
        statusCode: HttpStatus.CREATED,
        data: {
          id: 1,
          username: 'Admin',
          email: 'admin@saludnet.com',
          password: hashedPassword,
        },
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(hashedPassword);

      jest.spyOn(repository, 'create').mockReturnValue({
        ...createAdmin,
        password: hashedPassword,
      } as any);

      jest.spyOn(repository, 'save').mockResolvedValueOnce({
        id: 1,
        ...createAdmin,
        password: hashedPassword,
      } as Admin);

      const response = await service.create(createAdmin);

      expect(response).toEqual(result);
      expect(repository.create).toHaveBeenCalledWith({
        ...createAdmin,
        password: hashedPassword,
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...createAdmin,
        password: hashedPassword,
      });
    });
    it('should return conflict response if admin already exists', async () => {
      const existingAdmin: Admin = {
        id: 1, 
        username: 'Admin',
        email: 'admin@saludnet.com',
        password: 'admin1234',
        createId: function (): void {
          throw new Error('Function not implemented.');
        }
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingAdmin);

      const createAdminDto: CreateAdminDto = {
        username: 'Admin',
        email: 'admin@saludnet.com',
        password: 'admin1234'
      };

      const result = await service.create(createAdminDto);

      expect(result).toEqual({
        message: `El administrador con username ${createAdminDto.username} ya existe en la base de datos`,
        statusCode: HttpStatus.CONFLICT,
      });
    });

    it('should handle unexpected errors', async () => {
      const createAdmin: CreateAdminDto = {
        username: 'Admin',
        email: 'admin@saludnet.com',
        password: 'admin1234'
      };
      jest.spyOn(repository, 'findOne').mockRejectedValueOnce(new Error());

      await expect(service.create(createAdmin)).rejects.toThrow(HttpException);
    });
  });

  describe('findByEmail', () => {
    it('should find an admin by email', async () => {
      const email = 'admin@saludnet.com';
      const foundAdmin: Admin = {
        id: 1,
        username: 'Admin',
        email: 'admin@saludnet.com',
        password: 'hashedPassword',
        createId: function (): void {
          throw new Error('Function not implemented.');
        }
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(foundAdmin);

        const result = await service.findByEmail(email);

        expect(result).toEqual(foundAdmin);
    });

    it('should return 404 if admin with email not found', async () => {
      const email = 'notexistemail@saludnet.com';
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
    try{
     await service.findByEmail(email)
    } catch (error){
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Admin not found');
      expect(error.getStatus()).toEqual(HttpStatus.NOT_FOUND);
    }     
  });
  });
});
