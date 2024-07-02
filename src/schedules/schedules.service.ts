import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Repository } from 'typeorm';
import { IResponse } from '../interface/IResponse';
import { DeletionReason } from './enum/deleteSchedule.enum';
import { Doctor } from '../doctors/entities/doctor.entity';
@Injectable() 
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async createScheduleWithInterval(
    createScheduleDto: CreateScheduleDto,
  ): Promise<HttpException | CreateScheduleDto | IResponse> {
    try {
      const { day, idDoctor, start_Time, end_Time, interval } =
        createScheduleDto;
      const doctor = await this.doctorRepository.findOne({
        where: { id: idDoctor },
      });
      if (!doctor) {
        throw new HttpException(
          `El doctor con id ${idDoctor} no existe`,
          HttpStatus.NOT_FOUND,
        );
      }
      // Verificar si ya existe una agenda para este día y médico
      const existingSchedule = await this.scheduleRepository.findOne({
        where: { day, idDoctor, start_Time },
      });
      if (existingSchedule) {
        throw new HttpException(
          `La agenda para el ${day} y médico ${idDoctor} ya existe`,
          HttpStatus.CONFLICT,
        );
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
      if (error.status === HttpStatus.CONFLICT || HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSchedules(): Promise<HttpException | Schedule[] | IResponse> {
    try {
      const schedules = await this.scheduleRepository.find({
        where: { removed: false },
      });

      if (!schedules.length)
        throw new HttpException(
          'No existen agendas registradas',
          HttpStatus.NOT_FOUND,
        );
      return {
        message: 'Agendas registradas:',
        data: schedules,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findOneSchedule(
    id: number,
  ): Promise<HttpException | Schedule | IResponse> {
    try {
      const scheduleFound = await this.scheduleRepository.findOne({
        where: { idSchedule: id },
      });
      if (!scheduleFound) {
        throw new HttpException('Esa agenda no existe', HttpStatus.NOT_FOUND);
      }
      return {
        message: 'La agenda encontrada es:',
        data: scheduleFound,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async deleteSchedule(
    id: number,
    deletionReason: DeletionReason,
  ): Promise<HttpException | Schedule | IResponse> {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: { idSchedule: id },
      });
      if (!schedule) {
        throw new HttpException(
          `La agenda con ${id} no existe`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (!schedule.removed === true) {
        schedule.deletionReason = deletionReason;
        schedule.removed = true; // Marcar como eliminado

        await this.scheduleRepository.save(schedule);

        return {
          message: `Se ha marcado la agenda con id: ${schedule.idSchedule} como eliminada`,
          data: schedule.idSchedule,
          statusCode: HttpStatus.OK,
        };
      }
      throw new HttpException(
        `La agenda con ${id} ya se encuentra eliminada`,
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //Funcion para seleccionar turno o cancelarlo (pasa de true a false)
  async updateAvailability(
    idSchedule: number,
  ): Promise<IResponse | HttpException | UpdateScheduleDto> {
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
          message: 'Se ha cancelado el turno correctamente:',
          data: updatedSchedule,
          statusCode: HttpStatus.OK,
        };
      }
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findScheduleByDay(
    day: string,
    idDoctor: number,
  ): Promise<HttpException | Schedule[] | IResponse> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { id: idDoctor },
      });
      if (!doctor) {
        throw new HttpException(
          `No existe el doctor indicado`,
          HttpStatus.NOT_FOUND,
        );
      }

      const schedules = await this.scheduleRepository.find({
        where: { day: day, idDoctor: idDoctor, available: false },
        relations: ['idDoctors', 'shiff'],
      });

      if (!schedules.length) {
        throw new HttpException(
          `No hay turnos disponibles para el ${day}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Turnos tomamos en este dia:',
        data: schedules,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async countScheduleByDoctor(
    day: string,
    idDoctor: number,
  ): Promise<HttpException | Schedule[] | IResponse> {
    try {
     const doctor = await this.doctorRepository.findOne({ where: { id: idDoctor } });
     if (!doctor) {
       throw new HttpException(
         `No existe el doctor indicado`,
         HttpStatus.NOT_FOUND,
       );
     }
      const schedules = await this.scheduleRepository.find({
        where: { day: day, idDoctor: idDoctor, available: false },
        relations: ['idDoctors', 'shiff'],
      });
     
      if (schedules.length) {
        const count = schedules.length;
        return {
          message: `Los turnos del doctor ${schedules[0].idDoctors.fullName} son ${count} para el día ${day}`,
          data: schedules,
          statusCode: HttpStatus.OK,
        };
      } else {
        throw new HttpException(
          'No hay turnos reservados para el ${day} del médico',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getSchedulesByDoctor(
    idDoctor: number,
  ): Promise<HttpException | Schedule[] | IResponse> {
    try {
      const doctor = await this.doctorRepository.findOne({ where: { id: idDoctor } });
      if (!doctor) {
        throw new HttpException(
          `No existe el doctor indicado`,
          HttpStatus.NOT_FOUND,
        );
      }
      const schedules = await this.scheduleRepository.find({
        where: { idDoctor, available: true , removed: false },
      });

      if (!schedules.length)
        throw new HttpException(
           `No existen agendas registradas para el doctor ${schedules[0].idDoctors.fullName}`,
           HttpStatus.NOT_FOUND,
        );
      return {
        message: 'Turnos disponibles para el doctor :',
        data: schedules,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }}
    async deleteSchedulesByDoctorAndDate(
      doctorId: number,
      date: string,
      deletionReason: DeletionReason,
    ): Promise<HttpException | IResponse> {
      try {
        const schedules = await this.scheduleRepository.find({
          where: { idDoctor: doctorId, day: date, removed: false },
        });
    
        if (schedules.length === 0) {
          throw new HttpException(
            `No se encontraron horarios para el doctor con ID ${doctorId} en la fecha ${date}`,
            HttpStatus.NOT_FOUND,
          );
        }
    
        for (const schedule of schedules) {
          schedule.deletionReason = deletionReason;
          schedule.removed = true; // Marcar como eliminado
          await this.scheduleRepository.save(schedule);
        }
    
        return {
          message: `Se han eliminado ${schedules.length} horarios para el doctor con ID ${doctorId} en la fecha ${date}`,
          data: schedules.map((schedule) => schedule.idSchedule),
          statusCode: HttpStatus.OK,
        };
      } catch (error) {
        if (error.status === HttpStatus.NOT_FOUND) {
          throw error;
        }
        throw new HttpException(
          'Error del servidor',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
}
