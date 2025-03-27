import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  Put,
} from '@nestjs/common';
import { ScheduleService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { IResponse } from '../interface/IResponse';
import { DeletionReason } from './enum/deleteSchedule.enum';
//import { AuthGuard } from '../auth/auth.guard';
import { EstadoTurno } from './enum/estados.enum';

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
    @Body('idPatient') idPatient: number,
  ): Promise<IResponse> {
    return await this.scheduleService.takeSchedule(idSchedule, idPatient);
  }

  @Get(':idDoctor?')
  getSchedulesByDoctor(
    @Param('idDoctor') idDoctor?: number,
    @Body('estado') estadoTurno?: EstadoTurno,
  ): Promise<HttpException | Schedule[] | IResponse> {
    return this.scheduleService.getSchedulesByDoctor(idDoctor, estadoTurno);
  }

  @Put(':id/change-status')
  async changeScheduleStatus(
    @Param('id') idSchedule: number,
    @Body()
    updateStatusDto: {
      estado: EstadoTurno;
      idPatient?: number;
      deletionReason?: DeletionReason;
    },
  ): Promise<Schedule> {
    return await this.scheduleService.changeScheduleStatus(
      idSchedule,
      updateStatusDto,
    );
  }

  @Get('test-update-expired-schedules') // Debe coincidir con la ruta que estás usando
  async testUpdateExpiredSchedules(): Promise<{ message: string }> {
    await this.scheduleService.updateExpiredSchedules();
    return { message: 'Función ejecutada manualmente' };
  }
}

// @Get()
// findAllSchedules() {
//   return this.scheduleService.getSchedules();
// }

// @Get(':id')
// findOneSchedule(
//   @Param('id') id: number,
// ): Promise<HttpException | Schedule | IResponse> {
//   return this.scheduleService.findOneSchedule(id);
// }

// @Delete(':id')
// async remove(
//   @Param('id') id: number,
//   @Body('deletionReason') deletionReason: DeletionReason,
// ): Promise<HttpException | Schedule | IResponse> {
//   return this.scheduleService.deleteSchedule(id, deletionReason);
// }

// @Delete(':doctorId/:date')
// async deleteSchedule(
//   @Param('doctorId') doctorId: number,
//   @Param('date') date: string,
//   @Body('deletionReason') deletionReason: DeletionReason,
// ): Promise<HttpException | IResponse> {
//   return this.scheduleService.deleteSchedulesByDoctorAndDate(
//     doctorId,
//     date,
//     deletionReason,
//   );
// }

/*@Get('/by-doctor/:idDoctor')
   getSchedulesByDoctor(
     @Param('idDoctor') idDoctor: number,
     @Body('estado') estadoTurno?:EstadoTurno
   ): Promise<HttpException | Schedule[] | IResponse> {
     return this.scheduleService.getSchedulesByDoctor(idDoctor,estadoTurno);
   }*/

