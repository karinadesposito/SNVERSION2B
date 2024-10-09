// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Delete,
//   HttpException,
//   UseGuards
// } from '@nestjs/common';
// import { ShiffService } from './shiff.service';
// import { CreateShiffDto } from './dto/create-shiff.dto';
// import { UpdateShiffDto } from './dto/update-shiff.dto';
// import { Shiff } from './entities/shiff.entity';
// import { IResponse } from '../interface/IResponse';
// import { AuthGuard } from '../auth/auth.guard';

// @Controller('shiff')
// export class ShiffController {
//   constructor(private readonly shiffService: ShiffService) {}
//   @Post()
//   async takeShiff(
//     @Body() newShiff: CreateShiffDto,
//   ): Promise<HttpException | CreateShiffDto | IResponse> {
//     const { idSchedule, idPatient } = newShiff;
//     return this.shiffService.takeShiff(idSchedule, idPatient);
//   }
//   @Get()
//   @UseGuards(AuthGuard)
//   getShiff(): Promise<UpdateShiffDto[] | IResponse | HttpException> {
//     return this.shiffService.getShiff();
//   }
//   @Get(':id')
//   @UseGuards(AuthGuard)
//   findOne(
//     @Param('id') id: number,
//   ): Promise<HttpException | UpdateShiffDto | IResponse> {
//     return this.shiffService.findOneShiff(id);
//   }
//   @Delete(':id')
//   @UseGuards(AuthGuard)
//   deleteShiff(
//     @Param('id') id: number,
//   ): Promise<HttpException | Shiff | IResponse> {
//     return this.shiffService.deleteShiff(id);
//   }
// }
