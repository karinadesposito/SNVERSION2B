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
type ResponseMessage = { message: string; data?: {}; statusCode: HttpStatus };
@Controller('shift')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}
  @Post()
  async takeShift(
    @Body() newShift: CreateShiftDto,
  ): Promise<HttpException | CreateShiftDto | ResponseMessage> {
    const { idSchedule, idDoctor, idPatient } = newShift;
    return this.shiftService.takeShift(idSchedule, idDoctor, idPatient);
  }
  @Get()
  getShift(): Promise<UpdateShiftDto[] | ResponseMessage | HttpException> {
    return this.shiftService.getShift();
  }
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Promise<HttpException | UpdateShiftDto | ResponseMessage> {
    return this.shiftService.findOneShift(id);
  }
  @Delete(':id')
  deleteShift(
    @Param('id') id: string,
  ): Promise<HttpException | Shift | ResponseMessage> {
    return this.shiftService.deleteShift(id);
  }
}
