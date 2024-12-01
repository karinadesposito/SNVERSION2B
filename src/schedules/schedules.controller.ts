import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  Put,
 Query
} from '@nestjs/common';
import { ScheduleService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { IResponse } from '../interface/IResponse';
import { DeletionReason } from './enum/deleteSchedule.enum';
import { AuthGuard } from '../auth/auth.guard';
import { EstadoTurno } from '../schedules/entities/schedule.entity';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post() 
  create(
    @Body() newSchedule: CreateScheduleDto,
  ): Promise<HttpException | CreateScheduleDto | IResponse | void> {
    return this.scheduleService.createScheduleWithInterval(newSchedule);
  }

  @Post(':idSchedule/take')
  async takeSchedule(
    @Param('idSchedule') idSchedule: number,
    @Body('idPatient') idPatient: number, // Asegúrate de que idPatient esté en el body
  ): Promise<IResponse> {
    return await this.scheduleService.takeSchedule(idSchedule, idPatient);
  }

  @Put(':id/change-status')
  async changeScheduleStatus(
    @Param('id') idSchedule: number,
    @Body() updateStatusDto: { estado: EstadoTurno; idPatient?: number; deletionReason?: DeletionReason },
  ): Promise<Schedule> {
  
    return await this.scheduleService.changeScheduleStatus(idSchedule, updateStatusDto);
  }
//   @Put('/batch/change-status')
// async changeMultipleSchedulesStatus(
//   @Body() updateBatchStatusDto: { ids: number[]; estado: EstadoTurno; deletionReason?: DeletionReason },
// ): Promise<Schedule[]> {
//   return await this.scheduleService.changeMultipleSchedulesStatus(updateBatchStatusDto);
// }


@Get('/report/:estado')
getSchedulesByFilters(
  @Param('estado') estado? : EstadoTurno,
  @Query('idDoctor') idDoctor?: number,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('patientId') patientId?: number
): Promise<Schedule[]> {
  return this.scheduleService.getSchedulesByFilters(estado, idDoctor, startDate, endDate, patientId);
}

}
