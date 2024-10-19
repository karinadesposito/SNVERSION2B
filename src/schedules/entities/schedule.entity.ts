import { Doctor } from '../../doctors/entities/doctor.entity';
// import { Shiff } from '../../shiff/entities/shiff.entity';
import { Patient } from '../../patients/entities/patient.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { DeletionReason } from '../enum/deleteSchedule.enum';



export enum EstadoTurno {
  DISPONIBLE = 'disponible', 
  CONFIRMADO = 'confirmado',//por el paciente, mail confirmatorio, recordatorio?//
  CANCELADO = 'cancelado',//cancelado x paciente 
  ELIMINADO = 'eliminado', //en el caso de que lo elimine el médico
  EJECUTADO = 'ejecutado',
  NO_ASISTIDO = 'no_asistido',//no fue el paciente
  NO_RESERVADO = 'no_reservado'//quedaron disponibles
}

@Entity({ name: 'schedules' })
export class Schedule {
  @PrimaryGeneratedColumn()
  idSchedule: number;

  @Column()
  idDoctor: number;

  @Column({ type: 'date' })
  // se pone 2024,01,01
  day: string;

  @Column({ type: 'time' })
  start_Time: string;

  @Column({ type: 'time' })
  end_Time: string;
  
  @Column({ type: 'enum', enum: DeletionReason, nullable: true })
  deletionReason: DeletionReason;

  @Column({ default: false })
  removed: boolean;

  @Column({ default: 30 })
  interval: string;
  static available: number;

  @Column({
    type: 'enum',
    enum: EstadoTurno,
    default: EstadoTurno.DISPONIBLE,
  })
  estado: EstadoTurno;

  @ManyToOne(() => Doctor, (doctor) => doctor.schedule)
  @JoinColumn({ name: 'idDoctor' })
  idDoctors: Doctor;

  // Relación con Paciente
  @ManyToOne(() => Patient, (patient) => patient.schedules, { nullable: true })
  patient: Patient | null; // Nullable porque un turno puede estar "disponible" sin estar reservado por un paciente
}