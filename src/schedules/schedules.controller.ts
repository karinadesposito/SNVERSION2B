import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  Put,
 
} from '@nestjs/common';
import { ScheduleService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { EstadoTurno, Schedule } from './entities/schedule.entity';
import { IResponse } from '../interface/IResponse';
import { DeletionReason } from './enum/deleteSchedule.enum';
import { AuthGuard } from '../auth/auth.guard';

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

  @Get()
  findAllSchedules() {
    return this.scheduleService.getSchedules();
  }

  @Get(':id') 
  findOneSchedule(
    @Param('id') id: number,
  ): Promise<HttpException | Schedule | IResponse> {
    return this.scheduleService.findOneSchedule(id);
  }

  @Delete(':id') 
  async remove(
    @Param('id') id: number,
    @Body('deletionReason') deletionReason: DeletionReason,
  ): Promise<HttpException | Schedule | IResponse> {
    return this.scheduleService.deleteSchedule(id, deletionReason);
  }
  // @Put('/updateAvailability/:idSchedule')
  // async updateAvailability(
  //   @Param('idSchedule') idSchedule: number,
  // ): Promise<HttpException | UpdateScheduleDto | IResponse> {
  //   return await this.scheduleService.updateAvailability(idSchedule);
  // }

  // @Get('/schedules/count')
  // @ards(AuthGuard)
  // async getCountTake(
  //   @Body() body: { idDoctor: number; day: string },
  // ): Promise<IResponse | HttpException | Schedule[]> {
  //   const { idDoctor, day } = body;
  //   return this.scheduleService.countScheduleByDoctor(day, idDoctor);
  // }
  @Get('/by-doctor/:idDoctor')
  getSchedulesByDoctor(
    @Param('idDoctor') idDoctor: number,
  ): Promise<HttpException | Schedule[] | IResponse> {
    return this.scheduleService.getSchedulesByDoctor(idDoctor);
  }

  // @Get('/schedules/byDay')
  // 
  // async findScheduleByDay(
  //   @Body() body: { idDoctor: number; day: string },
  // ): Promise<IResponse | HttpException | Schedule[]> {
  //   const { idDoctor, day } = body;
  //   return this.scheduleService.findScheduleByDay(day, idDoctor);
  // }
  @Delete(':doctorId/:date')

  async deleteSchedule(
    @Param('doctorId') doctorId: number,
    @Param('date') date: string,
    @Body('deletionReason') deletionReason: DeletionReason,
  ): Promise<HttpException | IResponse> {
    return this.scheduleService.deleteSchedulesByDoctorAndDate(
      doctorId,
      date,
      deletionReason,
    );
  }

  @Put(':idSchedule/status')
  async changeScheduleStatus(
    @Param('idSchedule') idSchedule: number,
    @Body('estado') newStatus: EstadoTurno,
  ): Promise<HttpException | IResponse> {
    return this.scheduleService.changeScheduleStatus(idSchedule, newStatus);
  }
}
