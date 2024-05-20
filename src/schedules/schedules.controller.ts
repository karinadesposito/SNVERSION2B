import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { ScheduleService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { IResponse } from 'src/interface/IResponse';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
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
  findOneSchedule(
    @Param('id') id: string,
  ): Promise<HttpException | Schedule | IResponse> {
    return this.scheduleService.findOneSchedule(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.updateSchedule(id, updateScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.deleteSchedule(id);
  }
  @Put('/updateAvailability/:idSchedule')
  async updateAvailability(
    @Param('idSchedule') idSchedule: string,
  ): Promise<HttpException | UpdateScheduleDto | IResponse> {
    return await this.scheduleService.updateAvailability(idSchedule);
  }

  @Get('/schedules/count')
  async getCountTake(
    @Body() body: { idDoctor: string, day: string }
  ): Promise<IResponse | HttpException | Schedule[]> {
    const { idDoctor, day } = body;
    return this.scheduleService.countScheduleByDoctor(day, idDoctor);
  }
}
