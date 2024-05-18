import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { Shift } from './entities/shift.entity';
import { IResponse } from 'src/interface/IResponse';

@Controller('shift')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}
  @Post()
  async takeShift(
    @Body() newShift: CreateShiftDto,
  ): Promise<HttpException | CreateShiftDto | IResponse> {
    const { idSchedule, idPatient } = newShift;
    return this.shiftService.takeShift(idSchedule, idPatient);
  }
  @Get()
  getShift(): Promise<UpdateShiftDto[] | IResponse | HttpException> {
    return this.shiftService.getShift();
  }
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Promise<HttpException | UpdateShiftDto | IResponse> {
    return this.shiftService.findOneShift(id);
  }
  @Delete(':id')
  deleteShift(
    @Param('id') id: string,
  ): Promise<HttpException | Shift | IResponse> {
    return this.shiftService.deleteShift(id);
  }
}
