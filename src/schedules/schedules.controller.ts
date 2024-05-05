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
type ResponseMessage = { message: string; data?: {}; statusCode: HttpStatus };

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(
    @Body() newSchedule: CreateScheduleDto,
  ): Promise<HttpException | CreateScheduleDto | ResponseMessage | void> {
    return this.scheduleService.createScheduleWithInterval(newSchedule);
  }

  @Get()
  findAllSchedules() {
    return this.scheduleService.getSchedules();
  }

  @Get(':id')
  findOneSchedule(
    @Param('id') id: string,
  ): Promise<HttpException | Schedule | ResponseMessage> {
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
  ): Promise<HttpException | UpdateScheduleDto | ResponseMessage> {
    return await this.scheduleService.updateAvailability(idSchedule);
  }
}
