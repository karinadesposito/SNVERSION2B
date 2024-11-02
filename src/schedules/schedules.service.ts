import { HttpException, HttpStatus, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Repository, LessThan, LessThanOrEqual, Between, MoreThanOrEqual } from 'typeorm';
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
    
    // async actualizarEstadoNoReservado(): Promise<void> {
    //   const currentDate = new Date(); // Fecha y hora actual
    //   const currentDateString = currentDate.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
    //   const currentTimeString = currentDate.toTimeString().split(' ')[0]; // Formato 'HH:MM:SS'
  
    //   // Obtener todos los turnos que están disponibles
    //   const schedules = await this.scheduleRepository.find({
    //     where: { estado: EstadoTurno.DISPONIBLE },
    //   });
  
    //   for (const schedule of schedules) {
    //     const scheduleDate = schedule.day.toString().split('T')[0]; // Convierte el día a 'YYYY-MM-DD'
    //     const scheduleTime = schedule.start_Time; // Asumiendo que es un string en formato 'HH:MM:SS'
  
    //     // Compara la fecha y hora
    //     if (
    //       (scheduleDate < currentDateString) || // Si la fecha es anterior a hoy
    //       (scheduleDate === currentDateString && scheduleTime < currentTimeString) // Si es hoy y la hora ya pasó
    //     ) {
    //       // Cambiar el estado a 'NO_RESERVADO'
    //       schedule.estado = EstadoTurno.NO_RESERVADO;
    //       await this.scheduleRepository.save(schedule);
    //     }
    //   }
    // }
   
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
        [EstadoTurno.DISPONIBLE]: [EstadoTurno.CONFIRMADO, EstadoTurno.NO_RESERVADO,EstadoTurno.ELIMINADO],
        [EstadoTurno.CONFIRMADO]: [EstadoTurno.EJECUTADO, EstadoTurno.NO_ASISTIDO, EstadoTurno.CANCELADO,EstadoTurno.ELIMINADO,],
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
    

//     @Cron('0 0 * * *') // Ejecuta a medianoche todos los días
//     async updateExpiredSchedules(): Promise<void> {
//       // Obtener la fecha y hora actual en la zona horaria de Buenos Aires
//       const now = new Date();
//       const nowInBuenosAires = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    
//       const currentDate = nowInBuenosAires.toISOString().slice(0, 10); // YYYY-MM-DD
//       const currentTime = nowInBuenosAires.toISOString().slice(11, 19); // HH:mm:ss
    
//       console.log(`Fecha actual: ${currentDate}, Hora actual: ${currentTime}`);
    
//       // Buscar todos los turnos disponibles que son anteriores a la fecha y hora actual
//       const expiredSchedules = await this.scheduleRepository.find({
//         where: {
//           estado: EstadoTurno.DISPONIBLE,
//           day: LessThan(currentDate), // Busca turnos de días anteriores
//         },
//       });
    
//       // Filtrar los turnos que han pasado la hora actual
//       const filteredExpiredSchedules = expiredSchedules.filter(schedule => {
//         return schedule.start_Time < currentTime; // Solo incluir turnos que ya han pasado la hora actual
//       });
    
//       console.log(`Turnos expirados encontrados: ${filteredExpiredSchedules.length}`);
    
//       for (const schedule of filteredExpiredSchedules) {
//         console.log(`Actualizando turno: ${schedule.idSchedule}, Estado anterior: ${schedule.estado}`);
//         schedule.estado = EstadoTurno.NO_RESERVADO;
//         await this.scheduleRepository.save(schedule);
//       }
//     }
// }
async getSchedulesByFilters(
  estado: EstadoTurno,
  idDoctor?: number,
  startDate?: string,
  endDate?: string,
  patientId?: number
): Promise<Schedule[]> {
  const filters: any = { estado };

  // Filtrar por doctor si se especifica
  if (idDoctor) {
    filters.idDoctor = idDoctor;
  }

  // Filtrar por paciente si se especifica
  if (patientId) {
    filters.patient = { id: patientId };
  }

  // Filtrar por rango de fechas
  if (startDate && endDate) {
    filters.day = Between(startDate, endDate);
  } else if (startDate) {
    filters.day = MoreThanOrEqual(startDate);
  } else if (endDate) {
    filters.day = LessThanOrEqual(endDate);
  }

  // Consultar los turnos con los filtros aplicados
  return this.scheduleRepository.find({
    where: filters,
    relations: ['patient', 'idDoctors'], // Relacionar con entidades asociadas si es necesario
  });
}

async updateExpiredSchedules(): Promise<void> {
  const now = new Date(); // Obtén la fecha y hora actual
  // Busca los turnos disponibles que han expirado
  const expiredSchedules = await this.scheduleRepository
    .createQueryBuilder('schedule')
    .where('schedule.estado = :estado', { estado: EstadoTurno.DISPONIBLE })
    .andWhere('DATE(schedule.day) < :today OR (DATE(schedule.day) = :today AND TIME(schedule.end_Time) < :now)', {
      today: now.toISOString().split('T')[0], // Fecha de hoy
      now: now.toTimeString().split(' ')[0], // Hora actual
    })
    .getMany();

  // Actualiza el estado de los turnos expirados a NO_RESERVADO
  if (expiredSchedules.length > 0) {
    for (const schedule of expiredSchedules) {
      schedule.estado = EstadoTurno.NO_RESERVADO;
    }
    await this.scheduleRepository.save(expiredSchedules); // Guarda los cambios en la base de datos
    console.log(`Turnos expirados actualizados: ${expiredSchedules.length}`);
  } else {
    console.log('No se encontraron turnos expirados');
  }
}



  }


