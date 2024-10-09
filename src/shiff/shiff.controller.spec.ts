// import { Test, TestingModule } from '@nestjs/testing';
// import { ShiffController } from './shiff.controller';
// import { ShiffService } from './shiff.service';
// import { CreateShiffDto } from './dto/create-shiff.dto';
// import { IResponse } from 'src/interface/IResponse';
// import { HttpStatus } from '@nestjs/common';
// import { UpdateShiffDto } from './dto/update-shiff.dto';
// import { Shiff } from './entities/shiff.entity';

// describe('ShiffController', () => {
//   let controller: ShiffController;
//   let service: ShiffService;
//   const ids = { id: 1, idSchedule: 1, idPatient: 1 };
//   const id = 1;

//   beforeEach(async () => {
//     const mockShiffService = {
//       takeShiff: jest.fn(),
//       getShiff: jest.fn(),
//       findOneShiff: jest.fn(),
//       deleteShiff: jest.fn(),
//     };
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [ShiffController],
//       providers: [{ provide: ShiffService, useValue: mockShiffService }],
//     }).compile();

//     controller = module.get<ShiffController>(ShiffController);
//     service = module.get<ShiffService>(ShiffService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
//   describe('takeShiff', () => {
//     it('should call shiffService.takeShiff and return the result', async () => {
//       const newShiff: CreateShiffDto = ids;
//       const result: IResponse = {
//         message: 'El turno se ha guardado',
//         statusCode: HttpStatus.OK,
//         data: newShiff,
//       };

//       jest.spyOn(service, 'takeShiff').mockResolvedValue(result);

//       const response = await controller.takeShiff(newShiff);
//       expect(response).toEqual(result);
//       expect(service.takeShiff).toHaveBeenCalledWith(
//         newShiff.idSchedule,
//         newShiff.idPatient,
//       );
//     });
//   });

//   describe('getShiff', () => {
//     it('should call service.getShiff and return the result', async () => {
//       const shiffs: UpdateShiffDto[] = [ids];
//       const result: IResponse = {
//         message: 'Los turnos existentes son:',
//         statusCode: HttpStatus.OK,
//         data: shiffs,
//       };

//       jest.spyOn(service, 'getShiff').mockResolvedValue(result);

//       const response = await controller.getShiff();
//       expect(response).toEqual(result);
//       expect(service.getShiff).toHaveBeenCalled();
//     });
//   });

//   describe('findOneShiff', () => {
//     it('should call service.findOneShiff with correct params', async () => {
//       const shiff: UpdateShiffDto = ids;
//       const result: IResponse = {
//         message: 'El turno hallado es:',
//         statusCode: HttpStatus.OK,
//         data: shiff,
//       };

//       jest.spyOn(service, 'findOneShiff').mockResolvedValue(result);

//       const response = await controller.findOne(id);
//       expect(service.findOneShiff).toHaveBeenCalledWith(id);
//       expect(response).toEqual(result);
//     });
//   });

//   describe('deleteShiff', () => {
//     it('should call service.deleteShiff with correct params', async () => {
//       const shiff: Shiff = new Shiff();
//       const result: IResponse = {
//         message: 'Se ha eliminado el turno:',
//         statusCode: HttpStatus.OK,
//         data: shiff,
//       };

//       jest.spyOn(service, 'deleteShiff').mockResolvedValue(result);

//       const response = await controller.deleteShiff(id);
//       expect(service.deleteShiff).toHaveBeenCalledWith(id);
//       expect(response).toEqual(result);
//     });
//   });
// });
