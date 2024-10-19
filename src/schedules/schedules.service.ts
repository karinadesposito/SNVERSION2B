import { HttpException, HttpStatus, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Repository, LessThan, LessThanOrEqual } from 'typeorm';
import { IResponse } from '../interface/IResponse';
import { DeletionReason } from './enum/deleteSchedule.enum';
import { Doctor } from '../doctors/entities/doctor.entity';
import { EstadoTurno } from '../schedules/entities/schedule.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Cron } from '@nestjs/schedule';

@Injectable() 
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient) 
    private patientRepository: Repository<Patient>, 
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
          newSchedule.estado = EstadoTurno.DISPONIBLE; // Asignar el estado a DISPONIBLE
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
  
    async deleteSchedulesByDoctorAndDate(
      doctorId: number,
      date: string,
      deletionReason: DeletionReason,
    ): Promise<HttpException | IResponse> {
      console.log(`Attempting to delete schedule for doctorId: ${doctorId} on date: ${date}`); // Log para depuración
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
    
    async takeSchedule(
      idSchedule: number,
      idPatient: number,
    ): Promise<IResponse> {
      try {
        // Buscar el horario por ID
        const schedule = await this.scheduleRepository.findOne({
          where: { idSchedule },
          relations: ['patient', 'idDoctors'], // Cargar las relaciones necesarias
        });
    
        if (!schedule) {
          throw new HttpException('Horario no encontrado', HttpStatus.NOT_FOUND);
        }
    
        if (schedule.removed) {
          throw new HttpException('Horario ha sido eliminado', HttpStatus.NOT_FOUND);
        }
    
        if (schedule.estado !== EstadoTurno.DISPONIBLE) {
          throw new HttpException('Horario no disponible', HttpStatus.CONFLICT);
        }
    
        // Buscar el paciente por ID
        const patient = await this.patientRepository.findOne({
          where: { id: idPatient },
        });
    
        if (!patient) {
          throw new HttpException('Paciente no encontrado', HttpStatus.NOT_FOUND);
        }
    
        // Verificar si el paciente ya tiene un turno con el mismo doctor y día
        const existingTurn = await this.scheduleRepository.findOne({
          where: {
            patient: patient, // Usamos la relación en lugar del id directamente
            idDoctor: schedule.idDoctor,
            day: schedule.day,
            estado: EstadoTurno.CONFIRMADO,
          },
        });
    
        if (existingTurn) {
          throw new HttpException(
            `El paciente con DNI ${patient.dni} ya tiene un turno confirmado con el doctor ${schedule.idDoctor} para el día ${schedule.day}`,
            HttpStatus.CONFLICT,
          );
        }
    
        // Actualizar el estado del turno a "CONFIRMADO"
        schedule.estado = EstadoTurno.CONFIRMADO;
        schedule.patient = patient; // Asignamos el paciente directamente
    
        const savedSchedule = await this.scheduleRepository.save(schedule);
    
        return {
          message: 'El turno se ha confirmado',
          data: savedSchedule,
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
    async getSchedulesByDoctor(
      idDoctor: number,
      estado?: EstadoTurno, // Parámetro opcional para el estado del turno
    ): Promise<HttpException | IResponse> {
      try {
        const doctor = await this.doctorRepository.findOne({ where: { id: idDoctor } });
        if (!doctor) {
          throw new HttpException(
            `No existe el doctor indicado`,
            HttpStatus.NOT_FOUND,
          );
        }
    
        const whereCondition = { idDoctor }; // Condición básica
        if (estado) {
          whereCondition['estado'] = estado; // Filtrar por estado si se proporciona
        }
    
        const schedules = await this.scheduleRepository.find({
          where: whereCondition,
          relations: ['idDoctors', 'patient'],
        });
    
        if (!schedules.length) {
          throw new HttpException(
            `No existen agendas registradas para el doctor ${doctor.fullName}`,
            HttpStatus.NOT_FOUND,
          );
        }
    
        return {
          message: 'Turnos disponibles para el doctor:',
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
    
    async actualizarEstadoNoReservado(): Promise<void> {
      const currentDate = new Date(); // Fecha y hora actual
      const currentDateString = currentDate.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
      const currentTimeString = currentDate.toTimeString().split(' ')[0]; // Formato 'HH:MM:SS'
  
      // Obtener todos los turnos que están disponibles
      const schedules = await this.scheduleRepository.find({
        where: { estado: EstadoTurno.DISPONIBLE },
      });
  
      for (const schedule of schedules) {
        const scheduleDate = schedule.day.toString().split('T')[0]; // Convierte el día a 'YYYY-MM-DD'
        const scheduleTime = schedule.start_Time; // Asumiendo que es un string en formato 'HH:MM:SS'
  
        // Compara la fecha y hora
        if (
          (scheduleDate < currentDateString) || // Si la fecha es anterior a hoy
          (scheduleDate === currentDateString && scheduleTime < currentTimeString) // Si es hoy y la hora ya pasó
        ) {
          // Cambiar el estado a 'NO_RESERVADO'
          schedule.estado = EstadoTurno.NO_RESERVADO;
          await this.scheduleRepository.save(schedule);
        }
      }
    }
   
    async changeScheduleStatus(
      idSchedule: number,
      { estado, idPatient, deletionReason }: { estado: EstadoTurno; idPatient?: number; deletionReason?: DeletionReason },
    ): Promise<Schedule> {
      const schedule = await this.scheduleRepository.findOne({ where: { idSchedule }, relations: ['patient'] });
      
      if (!schedule) {
        throw new NotFoundException('Turno no encontrado');
      }
    
      // Transiciones válidas entre estados
      const transicionesValidas = {
        [EstadoTurno.DISPONIBLE]: [EstadoTurno.CONFIRMADO, EstadoTurno.NO_RESERVADO],
        [EstadoTurno.CONFIRMADO]: [EstadoTurno.EJECUTADO, EstadoTurno.NO_ASISTIDO, EstadoTurno.CANCELADO],
        [EstadoTurno.CANCELADO]: [EstadoTurno.DISPONIBLE], // cuando cancela el paciente, vuelve a disponible
        [EstadoTurno.EJECUTADO]: [], // No puede pasar a otro estado
        [EstadoTurno.NO_ASISTIDO]: [], // No puede pasar a otro estado
        [EstadoTurno.NO_RESERVADO]: [], // No puede pasar a otro estado
        [EstadoTurno.ELIMINADO]: [] // No puede pasar a otro estado
      };
    
      // Función para validar transiciones
      const esTransicionValida = (estadoActual: EstadoTurno, nuevoEstado: EstadoTurno): boolean => {
        const transiciones = transicionesValidas[estadoActual];
        return transiciones.includes(nuevoEstado);
      };
    
      // Lógica para cambios de estado
      switch (estado) {
        case EstadoTurno.ELIMINADO:
          if (!esTransicionValida(schedule.estado, EstadoTurno.ELIMINADO)) {
            throw new BadRequestException('Transición no válida desde el estado actual');
          }
          schedule.estado = EstadoTurno.ELIMINADO;
          schedule.removed = true;
          schedule.deletionReason = deletionReason || null;
          schedule.patient = null; // Si el turno estaba reservado, lo desasignamos
          break;
    
        case EstadoTurno.EJECUTADO:
          if (!esTransicionValida(schedule.estado, EstadoTurno.EJECUTADO)) {
            throw new BadRequestException('Transición no válida desde el estado actual');
          }
          if (schedule.estado !== EstadoTurno.CONFIRMADO) {
            throw new BadRequestException('El turno debe estar confirmado para ser ejecutado');
          }
          schedule.estado = EstadoTurno.EJECUTADO;
          break;
    
        case EstadoTurno.NO_ASISTIDO:
          if (!esTransicionValida(schedule.estado, EstadoTurno.NO_ASISTIDO)) {
            throw new BadRequestException('Transición no válida desde el estado actual');
          }
          if (schedule.estado !== EstadoTurno.CONFIRMADO) {
            throw new BadRequestException('El turno debe estar confirmado para marcarlo como no asistido');
          }
          schedule.estado = EstadoTurno.NO_ASISTIDO;
          break;
    
        case EstadoTurno.CANCELADO:
          if (!esTransicionValida(schedule.estado, EstadoTurno.CANCELADO)) {
            throw new BadRequestException('Transición no válida desde el estado actual');
          }
          if (!schedule.patient) {
            throw new BadRequestException('El turno no está reservado');
          }
          schedule.estado = EstadoTurno.DISPONIBLE; // Cambiamos a DISPONIBLE al cancelar
          schedule.patient = null; // Liberamos el turno
          break;
    
        case EstadoTurno.DISPONIBLE:
          if (!esTransicionValida(schedule.estado, EstadoTurno.DISPONIBLE)) {
            throw new BadRequestException('Transición no válida desde el estado actual');
          }
          schedule.estado = EstadoTurno.DISPONIBLE;
          schedule.patient = null; // Desasignamos el paciente si estaba reservado
          break;
    
        default:
          throw new BadRequestException('Estado no válido');
      }
    
      return await this.scheduleRepository.save(schedule);
    }
    


  // Este cron se ejecutará cada noche a la medianoche para verificar los turnos expirados
  @Cron('0 0 * * *')
  async updateExpiredSchedules(): Promise<void> {
    const now = new Date();
    const expiredSchedules = await this.scheduleRepository.find({
      where: {
        estado: EstadoTurno.DISPONIBLE,
        day: LessThanOrEqual(now.toISOString().slice(0, 10)),  // Comparar por la fecha
        start_Time: LessThan(now.toISOString().slice(11, 19))  // Comparar por la hora
      }
    });
    console.log(`Turnos expirados encontrados: ${expiredSchedules.length}`);
    for (const schedule of expiredSchedules) {
     
      schedule.estado = EstadoTurno.NO_RESERVADO;
      await this.scheduleRepository.save(schedule);
    }
  }

}


