import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { Shift } from './entities/shift.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Patient } from '../patients/entities/patient.entity';
import { ScheduleService } from '../schedules/schedules.service';
import { IResponse } from '../interface/IResponse';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift) private shiftRepository: Repository<Shift>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly scheduleService: ScheduleService,
  ) {}
  async takeShift(
    idSchedule: string,
    idPatient: string,
  ): Promise<CreateShiftDto | IResponse> {
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
      const shift = new Shift();
      shift.idPatient = patient;
      shift.schedule = schedule;
  
      const savedShift = await this.shiftRepository.save(shift);
  
      await this.scheduleService.updateAvailability(idSchedule);
      return {
        message: 'El turno se ha guardado',
        data: savedShift,
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
  async getShift(): Promise<UpdateShiftDto[] | HttpException | IResponse> {
    try {
      const shift = await this.shiftRepository.find({
        relations: ['idDoctor', 'idPatient', 'schedule'],
      });
      if (!shift.length) {
        return {
          message: 'No existen turnos vigentes',
          statusCode: HttpStatus.OK,
        };
      } else {
        const result = shift.map((d) => ({
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
  async findOneShift(
    id: string,
  ): Promise<HttpException | UpdateShiftDto | IResponse> {
    try {
      const shift = await this.shiftRepository.findOne({
        where: { id: id },
      });
      if (!shift) {
        return {
          message: 'El turno no fue hallado',
          statusCode: HttpStatus.NOT_FOUND,
        };
      } else {
        return {
          message: 'El turno hallado es:',
          data: shift, 
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
  async deleteShift(id: string): Promise<HttpException | Shift | IResponse> {
    try {
      const shift = await this.shiftRepository.findOne({
        where: { id: id },
      });
      if (!shift) {
        return {
          message: 'El turno no ha sido encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        };
      } else {
        await this.shiftRepository.delete({ id: id });
        return {
          message: 'Se ha eliminado el turno:',
          data: shift,
          statusCode: HttpStatus.OK,
        };
      }
    } catch {
      throw new HttpException(
        'Ha ocurrido un error. No se logró eliminar el turno',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
