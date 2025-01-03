import { Doctor } from '../../doctors/entities/doctor.entity';
import { Patient } from '../../patients/entities/patient.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeletionReason } from '../enum/deleteSchedule.enum';
import { EstadoTurno } from '../enum/estados.enum';

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