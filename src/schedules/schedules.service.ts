import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Repository } from 'typeorm';

type ResponseMessage = { message: string; data?: {}; statusCode: HttpStatus };

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async createScheduleWithInterval(
    createScheduleDto: CreateScheduleDto,
  ): Promise<HttpException | CreateScheduleDto | ResponseMessage> {
    try {
      const { day, idDoctor, start_Time, end_Time, interval } =
        createScheduleDto;

      // Verificar si ya existe una agenda para este día y médico
      const existingSchedule = await this.scheduleRepository.findOne({
        where: { day, idDoctor, start_Time },
      });
      if (existingSchedule) {
        return {
          message: `La agenda para este día y médico ya existe`,
          data: existingSchedule,
          statusCode: HttpStatus.CONFLICT,
        };
      } else {
        const startTime = new Date(`01-01-2024 ${start_Time} GMT-0300`);
        const endTime = new Date(`01-01-2024 ${end_Time} GMT-0300`);
        const intervalInMinutes = parseInt(interval);
        const totalIntervals = Math.ceil(
          (endTime.getTime() - startTime.getTime()) /
            (intervalInMinutes * 60000),
        );

        const schedules = [];
        const currentTime = startTime;
        for (let i = 0; i < totalIntervals; i++) {
          const newSchedule = new Schedule();
          newSchedule.day = day;
          newSchedule.idDoctor = idDoctor;
          newSchedule.start_Time = currentTime.toLocaleTimeString('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
            hour12: false,
          });
          currentTime.setMinutes(currentTime.getMinutes() + intervalInMinutes);
          newSchedule.end_Time = currentTime.toLocaleTimeString('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
            hour12: false,
          });
          newSchedule.available = true;
          schedules.push(newSchedule);
        }

        await this.scheduleRepository.save(schedules);

        return {
          message: `La agenda ha sido creada exitosamente`,
          data: schedules.map((schedule) => ({
            Doctor: schedule.idDoctor,
            Dia: schedule.day,
            Hora: schedule.start_Time,
          })),
          statusCode: HttpStatus.CREATED,
        };
      }
    } catch (error) {
      throw new HttpException(
        'No se pudo crear la agenda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSchedules(): Promise<HttpException | Schedule[] | ResponseMessage> {
    try {
      const schedules = await this.scheduleRepository.find();

      if (!schedules.length)
        return {
          message: 'No existen agendas registradas',
          statusCode: HttpStatus.NO_CONTENT,
        };
      return {
        message: 'Agendas registradas:',
        data: schedules,
        statusCode: HttpStatus.FOUND,
      };
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido un error.No se pudo traer la lista de agendas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findOneSchedule(
    id: string,
  ): Promise<HttpException | Schedule | ResponseMessage> {
    try {
      const scheduleFound = await this.scheduleRepository.findOne({
        where: { idSchedule: id },
      });
      if (!scheduleFound) {
        return new HttpException('Esa agenda no existe', HttpStatus.NOT_FOUND);
      }
      return {
        message: 'La agenda encontrada es:',
        data: scheduleFound,
        statusCode: HttpStatus.FOUND,
      };
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido una falla en la busqueda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateSchedule(
    id: string,
    updateScheduleDto: Partial<UpdateScheduleDto>,
  ): Promise<HttpException | UpdateScheduleDto | ResponseMessage> {
    try {
      const scheduleFound = await this.scheduleRepository.findOne({
        where: { idSchedule: id },
      });
      if (!scheduleFound) {
        return new HttpException('Esa agenda no existe', HttpStatus.NOT_FOUND);
      }
      await this.scheduleRepository.update(id, updateScheduleDto);
      return {
        message: 'Las modificaciones son las siguientes: ',
        data: { ...updateScheduleDto, datosAnteriores: scheduleFound },
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return new HttpException(
        'Falló al actualizar la agenda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSchedule(
    id: string,
  ): Promise<HttpException | Schedule | ResponseMessage> {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: { idSchedule: id },
      });
      if (!schedule) {
        return new HttpException('La agenda no existe', HttpStatus.NOT_FOUND);
      }
      await this.scheduleRepository.delete({ idSchedule: id });
      return {
        message: 'Se ha eliminado la agenda con id: ',
        data: schedule.idSchedule,
        statusCode: HttpStatus.MOVED_PERMANENTLY,
      };
    } catch (error) {
      throw new HttpException(
        'No se pudo eliminar la agenda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //Funcion para seleccionar turno o cancelarlo (pasa de true a false)
  async updateAvailability(
    idSchedule: string,
  ): Promise<ResponseMessage | HttpException | UpdateScheduleDto> {
    try {
      const existingSchedule = await this.scheduleRepository.findOne({
        where: { idSchedule },
      });
      if (!existingSchedule) {
        throw new HttpException('El turno no existe', HttpStatus.NOT_FOUND);
      } else if (existingSchedule && existingSchedule.available === true) {
        await this.scheduleRepository.update(idSchedule, { available: false });
        const updatedSchedule = await this.scheduleRepository.findOne({
          where: { idSchedule },
        });
        return {
          message: 'El turno ha sido reservado correctamente',
          data: updatedSchedule,
          statusCode: HttpStatus.OK,
        };
      } else {
        await this.scheduleRepository.update(idSchedule, { available: true });
        const updatedSchedule = await this.scheduleRepository.findOne({
          where: { idSchedule },
        });
        return {
          message: 'Se ha cancelado el turno correctamente',
          data: updatedSchedule,
          statusCode: HttpStatus.OK,
        };
      }
    } catch (error) {
      throw new HttpException(
        'No se pudo actualizar la agenda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  }
