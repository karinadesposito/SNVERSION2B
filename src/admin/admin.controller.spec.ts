import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpStatus } from '@nestjs/common';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const mockAdminService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should call AdminService.create with correct parameters', async () => {
      const createAdminDto: CreateAdminDto = {
        username: 'adminTwo',
        email: 'admintwo@gmail.com',
        password:
          '$2a$10$dIvpfHYiCtllrZpXBAHeJ.9hikXmmZPWyTWFWfYoalYwyUjpPI3he',
      };
      const result: IResponse = {
        message: 'El administrador ha sido creado exitosamente',
        data: createAdminDto,
        statusCode: HttpStatus.CREATED,
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      const response = await controller.create(createAdminDto);
      expect(response).toEqual(result);
      expect(response).not.toBeUndefined();
      expect(service.create).toHaveBeenCalledWith(createAdminDto);
    });
  });

  describe('findOneAdmin', () => {
    it('should call AdminService.findByEmail with correct parameters', async () => {
      const email = 'admintwo@gmail.com';
      const search = {
        id: 383772,
        username: 'adminTwo',
        email: 'admintwo@gmail.com',
        password:
          '$2a$10$dIvpfHYiCtllrZpXBAHeJ.9hikXmmZPWyTWFWfYoalYwyUjpPI3he',
      createId:jest.fn(),
      };
  
      jest.spyOn(service, 'findByEmail').mockResolvedValue(search);
      const response = await controller.findOneAdmin(email);
      expect(response).not.toBeUndefined();
      expect(response).not.toBeNull();
      expect(service.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return a user from AdminService.findByEmail', async () => {
      const email = 'admintwo@gmail.com';
      const search = {
        id: 383772,
        username: 'adminTwo',
        email: 'admintwo@gmail.com',
        password:
          '$2a$10$dIvpfHYiCtllrZpXBAHeJ.9hikXmmZPWyTWFWfYoalYwyUjpPI3he',
      createId:jest.fn(),
      };

      jest.spyOn(service, 'findByEmail').mockResolvedValue(search);
      const result = await controller.findOneAdmin(email);
      expect(result).toMatchObject({
        id: 383772,
        username: 'adminTwo',
        email: 'admintwo@gmail.com',
        password:
          '$2a$10$dIvpfHYiCtllrZpXBAHeJ.9hikXmmZPWyTWFWfYoalYwyUjpPI3he',
      });
    });
  });
});
