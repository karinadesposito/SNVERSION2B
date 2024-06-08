import { Test, TestingModule } from '@nestjs/testing';
import { SpecialityController } from './speciality.controller';
import { SpecialityService } from './speciality.service';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { IResponse } from 'src/interface/IResponse';
import { HttpStatus } from '@nestjs/common';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';

describe('SpecialityController', () => {
  let controller: SpecialityController;
  let service: SpecialityService;

  beforeEach(async () => {
    const mockSpecialityService = {
      create: jest.fn(),
      getSpeciality: jest.fn(),
      findOneSpeciality: jest.fn(),
      updateSpeciality: jest.fn(),
      deleteSpeciality: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecialityController],
      providers: [
        {
          provide: SpecialityService,
          useValue: mockSpecialityService,
        },
      ],
    }).compile();

    controller = module.get<SpecialityController>(SpecialityController);
    service = module.get<SpecialityService>(SpecialityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

describe('create', () => {
  it('should call specialityService.create and return the result', async () => {
    const newSpeciality: CreateSpecialityDto = {
      name: 'Oftalmología'
    };
    const result: IResponse = {
      message: `La especialidad ha sido creado exitosamente`,
      statusCode: HttpStatus.OK,
    };

    jest.spyOn(service, 'create').mockResolvedValue(result);

    const response = await controller.create(newSpeciality);
    expect(response).toEqual(result);
    expect(response).not.toBeUndefined();
    expect(service.create).toHaveBeenCalledWith(newSpeciality);
  })
});
describe('getSpeciality', () => {
  it('should call service.getSpeciality', async () => {
    const search = [
      {
        id: '89820e',
        name: 'Oftalmología' 
      },
    ];
    const result: IResponse = {
      message: 'La lista de especialidades está compuesta por:',
      statusCode: HttpStatus.OK,
      data: search
    };
    jest.spyOn(service, 'getSpeciality').mockResolvedValue(result);
    const response = await controller.findAll();
    expect(service.getSpeciality).toHaveBeenCalled();
    expect(response).not.toBeUndefined();
  });
});
describe('findOneSpeciality', () => {
  it('should call service.findOneSpeciality with correct params', async () => {
    const id = '89820e';
    const search = [
      {
        id: '89820e',
        name: 'Oftalmología'
      },
    ];
    const result: IResponse = {
      message:'La especialidad encontrada es:',
      statusCode: HttpStatus.OK,
      data: search
    };
    jest.spyOn(service, 'findOneSpeciality').mockResolvedValue(result);
    const response = await controller.findOne(id);
    expect(service.findOneSpeciality).toHaveBeenCalledWith(id);
    expect(response).not.toBeUndefined();
    expect(response).not.toBeNull();
  });
});
describe('updateSpeciality', () => {
  it('should call service.updateSpeciality with correct params', async () => {
    const id = '89820e';
    const updateSpecialityDto: Partial<UpdateSpecialityDto> = {
      name: 'Nutricionista',
    };
    const result = {id : '89820e',name: 'Nutricionista' };
    jest.spyOn(service, 'updateSpeciality').mockResolvedValue(result);
    const response = await controller.update(id, updateSpecialityDto);
    expect(service.updateSpeciality).toHaveBeenCalledWith(id, updateSpecialityDto);
    expect(response).toEqual(result);
    expect(response).not.toBeUndefined();
    expect(response).not.toBeNull();
  });
});
describe('deleteSpeciality', () => {
  it('should call service.deleteSpeciality with correct params', async () => {
    const id = '89820e';
    const result = { message: 'Se ha eliminado la especialidad: ', statusCode:HttpStatus.OK };
    jest.spyOn(service, 'deleteSpeciality').mockResolvedValue(result);
    const response = await controller.remove(id);
    expect(service.deleteSpeciality).toHaveBeenCalledWith(id);
    expect(response).toEqual(result);
    expect(response).not.toBeUndefined;
    expect(response).not.toBeNull();
  });
});
});