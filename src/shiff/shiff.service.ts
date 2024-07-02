import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShiffDto } from './dto/create-shiff.dto';
import { UpdateShiffDto } from './dto/update-shiff.dto';
import { Shiff } from './entities/shiff.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Patient } from '../patients/entities/patient.entity';
import { ScheduleService } from '../schedules/schedules.service';
import { IResponse } from '../interface/IResponse';

@Injectable()
export class ShiffService {
  constructor(
    @InjectRepository(Shiff) private shiffRepository: Repository<Shiff>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly scheduleService: ScheduleService,
  ) {}

  async takeShiff(
    idSchedule: number,
    idPatient: number,
  ): Promise<CreateShiffDto | IResponse> {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: { idSchedule },
      });

      if (!schedule) {
        throw new HttpException('Horario no encontrado', HttpStatus.NOT_FOUND);
      }
      if (schedule.removed === true) {
        throw new HttpException(
          'Horario ha sido eliminado',
          HttpStatus.NOT_FOUND,
        );
      }
      if (!schedule.available) {
        throw new HttpException('Horario no disponible', HttpStatus.NOT_FOUND);
      }

      const patient = await this.patientRepository.findOne({
        where: { id: idPatient },
      });

      if (!patient) {
        throw new HttpException('Paciente no encontrado', HttpStatus.NOT_FOUND);
      }

      const existingShiff = await this.shiffRepository.findOne({
        where: {
          idPatient: patient,
          schedule: {
            idDoctor: schedule.idDoctor,
            day: schedule.day,
          },
        },
        relations: ['idPatient', 'schedule', 'schedule.idDoctors'],
      });

      if (existingShiff) {
        throw new HttpException(
          `El paciente con DNI ${patient.dni} ya tiene un turno con el doctor ${schedule.idDoctor} para el día ${schedule.day}`,
          HttpStatus.CONFLICT,
        );
      }

      const shiff = new Shiff();
      shiff.idPatient = patient;
      shiff.schedule = schedule;

      const savedShiff = await this.shiffRepository.save(shiff);

      await this.scheduleService.updateAvailability(idSchedule);

      return {
        message: 'El turno se ha guardado',
        data: savedShiff,
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND || HttpStatus.CONFLICT) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getShiff(): Promise<UpdateShiffDto[] | HttpException | IResponse> {
    try {
      const shiffs = await this.shiffRepository.find({
        relations: ['idPatient', 'schedule', 'schedule.idDoctors'],
      });

      if (!shiffs.length) {
        throw new HttpException(
          'No existen turnos vigentes',
          HttpStatus.NOT_FOUND,
        );
      } else {
        const result = shiffs.map((shiff) => ({
          id: shiff.id,
          Patient: {
            id: shiff.idPatient.id,
            fullName: shiff.idPatient.fullName,
            dni: shiff.idPatient.dni,
            phone: shiff.idPatient.phone,
          },
          Schedules: {
            idSchedule: shiff.schedule.idSchedule,
            day: shiff.schedule.day,
            start_Time: shiff.schedule.start_Time,
            end_Time: shiff.schedule.end_Time,
            fullName: shiff.schedule.idDoctors.fullName,
          },
        }));

        return {
          message: 'Los turnos existentes son:',
          data: result,
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
  async findOneShiff(
    id: number,
  ): Promise<HttpException | UpdateShiffDto | IResponse> {
    try {
      const shiff = await this.shiffRepository.findOne({
        where: { id: id },
      });
      if (!shiff) {
        throw new HttpException(
          'El turno no fue hallado',
          HttpStatus.NOT_FOUND,
        );
      } else {
        return {
          message: 'El turno hallado es:',
          data: shiff,
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
  //elimina el shiff ademas de modificar el estado de available de schedule
  async deleteShiff(id: number): Promise<HttpException | Shiff | IResponse> {
    try {
      const shiff = await this.shiffRepository.findOne({
        where: { id: id },
        relations: ['schedule'],
      });

      if (!shiff) {
        throw new HttpException(
          'El turno no ha sido encontrado',
          HttpStatus.NOT_FOUND,
        );
      }
      const idSchedule = shiff.schedule.idSchedule;

      await this.shiffRepository.delete({ id: id });

      await this.scheduleService.updateAvailability(idSchedule);

      return {
        message: 'Se ha eliminado el turno:',
        data: shiff,
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
