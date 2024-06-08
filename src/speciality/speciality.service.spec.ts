import { Test, TestingModule } from '@nestjs/testing';
import { SpecialityService } from './speciality.service';
import { Speciality } from './entities/speciality.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { HttpStatus } from '@nestjs/common';
import { IResponse } from 'src/interface/IResponse';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';

describe('SpecialityService', () => {
  let service: SpecialityService;
  let repository: Repository<Speciality>

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      getSpeciality: jest.fn(),
      findOneSpeciality: jest.fn(),
      updateSpeciality: jest.fn(),
      deleteSpeciality: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpecialityService,{ provide: getRepositoryToken(Speciality) , useValue: mockRepository }],
    }).compile();

    service = module.get<SpecialityService>(SpecialityService);
    repository = module.get<Repository<Speciality>>(getRepositoryToken(Speciality));  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
describe ('create',()=>{
it('should create a new speciality',async() =>{
  const createSpe: CreateSpecialityDto = {
    name: 'Odontología'
  }
  const result: IResponse = {
    message: `La especialidad ha sido creado exitosamente`,
    statusCode: HttpStatus.CREATED,
    data:createSpe
  };
  jest.spyOn(service,'create').mockResolvedValue(result);
  const response = await service.create(createSpe);
  expect(response).toEqual(result);
  expect(service.create).toHaveBeenCalledWith(createSpe);
})
})
describe ('getSpeciality',()=>{
  it('should return a list of speciality',async() =>{
    const specialities = [{
      id: '89820e',
      name: 'Oftalmología' 
    },]
    const result: IResponse = {
      message: 'La lista de especialidades está compuesta por:',
      statusCode: HttpStatus.OK,
      data:specialities
    };
    jest.spyOn(service,'getSpeciality').mockResolvedValue(result);
    const response = await service.getSpeciality();
    expect(response).toEqual(result);
    expect(service.getSpeciality).toHaveBeenCalledWith();
  })
  })
  describe ('findOneSpeciality',()=>{
    it('should call service.findOneSpeciality with correct params',async() =>{
     const id= '89820e';
      const speciality ={
        id: '89820e',
        name: 'Oftalmología' 
      };
      const result: IResponse = {
        message: 'La especialidad no fue encontrada',
        statusCode: HttpStatus.OK,
        data:speciality
      };
      jest.spyOn(service,'findOneSpeciality').mockResolvedValue(result);
      const response = await service.findOneSpeciality(id);
      expect(response).toEqual(result);
      expect(service.findOneSpeciality).toHaveBeenCalledWith(id);
    })
    })
  describe ('updateSpeciality',()=>{
    it('should call service.updateSpeciality with correct params',async() =>{
      const id= '89820e';
      const speciality: UpdateSpecialityDto = {
        name: 'Oftalmología' 
      }
      const result: IResponse = {
        message: 'Las modificaciones son las siguientes: ',
        statusCode: HttpStatus.OK,
        data:speciality
      };
      jest.spyOn(service,'updateSpeciality').mockResolvedValue(result);
      const response = await service.updateSpeciality(id,speciality);
      expect(response).toEqual(result);
      expect(service.updateSpeciality).toHaveBeenCalledWith(id,speciality);
    })
    })
    describe ('deleteSpeciality',()=>{
      it('should call service.deleteSpeciality with correct params',async() =>{
       const id= '89820e';
        const speciality ={
          id: '89820e',
          name: 'Oftalmología' 
        };
        const result: IResponse = {
          message: 'Se ha eliminado la especialidad: ',
          statusCode: HttpStatus.OK,
          data:speciality
        };
        jest.spyOn(service,'deleteSpeciality').mockResolvedValue(result);
        const response = await service.deleteSpeciality(id);
        expect(response).toEqual(result);
        expect(service.deleteSpeciality).toHaveBeenCalledWith(id);
      }) 
      })

});
