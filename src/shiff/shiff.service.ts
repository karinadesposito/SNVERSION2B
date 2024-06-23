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

      if (!schedule.available) {
        throw new HttpException('Horario no disponible', HttpStatus.NOT_FOUND);
      }
      const patient = await this.patientRepository.findOne({
        where: { id: idPatient },
      });
      if (!patient) {
        throw new HttpException('Paciente no encontrado', HttpStatus.NOT_FOUND);
      }
      const shiff = new Shiff();
      shiff.idPatient = patient;
      shiff.schedule = schedule;

      const savedShiff = await this.shiffRepository.save(shiff);

      await this.scheduleService.updateAvailability(idSchedule);
      return {
        message: 'El turno se ha guardado',
        data: savedShiff,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'No se pudo seleccionar el horario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getShiff(): Promise<UpdateShiffDto[] | HttpException | IResponse> {
    try {
      const shiff = await this.shiffRepository.find({
        relations: ['idDoctor', 'idPatient', 'schedule'],
      });
      if (!shiff.length) {
        return {
          message: 'No existen turnos vigentes',
          statusCode: HttpStatus.OK,
        };
      } else {
        const result = shiff.map((d) => ({
          id: d.id,
          Patient: d.idPatient,
          Schedules: d.schedule,
        }));
        return {
          message: 'Los turnos existentes son:',
          data: result,
          statusCode: HttpStatus.OK,
        };
      }
    } catch {
      throw new HttpException(
        'Ha ocurrido un error. No se accedió a la lista de turnos',
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
        return {
          message: 'El turno no fue hallado',
          statusCode: HttpStatus.NOT_FOUND,
        };
      } else {
        return {
          message: 'El turno hallado es:',
          data: shiff,
          statusCode: HttpStatus.OK,
        };
      }
    } catch {
      throw new HttpException(
        'Ha ocurrido una falla en la búsqueda',
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
        return {
          message: 'El turno no ha sido encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        };
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
      throw new HttpException(
        'Ha ocurrido un error. No se logró eliminar el turno',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
