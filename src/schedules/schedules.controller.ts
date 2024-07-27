import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { IResponse } from '../interface/IResponse';
import { DeletionReason } from './enum/deleteSchedule.enum';
import { AuthGuard } from '../auth/auth.guard';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() newSchedule: CreateScheduleDto,
  ): Promise<HttpException | CreateScheduleDto | IResponse | void> {
    return this.scheduleService.createScheduleWithInterval(newSchedule);
  }
 
  @Get()
  findAllSchedules() {
    return this.scheduleService.getSchedules();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOneSchedule(
    @Param('id') id: number,
  ): Promise<HttpException | Schedule | IResponse> {
    return this.scheduleService.findOneSchedule(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Param('id') id: number,
    @Body('deletionReason') deletionReason: DeletionReason,
  ): Promise<HttpException | Schedule | IResponse> {
    return this.scheduleService.deleteSchedule(id, deletionReason);
  }
  @Put('/updateAvailability/:idSchedule')
  async updateAvailability(
    @Param('idSchedule') idSchedule: number,
  ): Promise<HttpException | UpdateScheduleDto | IResponse> {
    return await this.scheduleService.updateAvailability(idSchedule);
  }

  @Get('/schedules/count')
  @UseGuards(AuthGuard)
  async getCountTake(
    @Body() body: { idDoctor: number; day: string },
  ): Promise<IResponse | HttpException | Schedule[]> {
    const { idDoctor, day } = body;
    return this.scheduleService.countScheduleByDoctor(day, idDoctor);
  }
  @Get('/by-doctor/:idDoctor')
  getSchedulesByDoctor(
    @Param('idDoctor') idDoctor: number,
  ): Promise<HttpException | Schedule[] | IResponse> {
    return this.scheduleService.getSchedulesByDoctor(idDoctor);
  }

  @Get('/schedules/byDay')
  @UseGuards(AuthGuard)
  async findScheduleByDay(
    @Body() body: { idDoctor: number; day: string },
  ): Promise<IResponse | HttpException | Schedule[]> {
    const { idDoctor, day } = body;
    return this.scheduleService.findScheduleByDay(day, idDoctor);
  }
  @Delete(':doctorId/:date')
  @UseGuards(AuthGuard)
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
}
