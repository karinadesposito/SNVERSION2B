import { Doctor } from '../../doctors/entities/doctor.entity';
import { Shiff } from '../../shiff/entities/shiff.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { DeletionReason } from '../enum/deleteSchedule.enum';

@Entity({ name: 'schedules' })
export class Schedule {
  @PrimaryGeneratedColumn()
  idSchedule: number;

  @Column({ type: 'date' })
  // se pone 2024,01,01
  day: string;

  @Column()
  idDoctor: number;

  @Column({ type: 'time' })
  start_Time: string;

  @Column({ type: 'time' })
  end_Time: string;

  @Column()
  available: boolean;

  @Column({ type: 'enum', enum: DeletionReason, nullable: true })
  deletionReason: DeletionReason;

  @Column({ default: false })
  removed: boolean;

  @Column({ default: 30 })
  interval: string;
  static available: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.schedule)
  @JoinColumn({ name: 'idDoctor' })
  idDoctors: Doctor;

  @OneToOne(() => Shiff, (shiff) => shiff.schedule)
  shiff: Shiff;
}
