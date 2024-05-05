import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Shift } from 'src/shift/entities/shift.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeInsert,
  JoinColumn,
  OneToOne,
} from 'typeorm';
const { v4: uuidv4 } = require('uuid');

@Entity({ name: 'schedules' })
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  idSchedule: string;
  @Column({ type: 'date' })
  // se pone 2024,01,01
  day: string;

  @Column({ type: 'uuid' })
  idDoctor: string;

  @Column({ type: 'time' })
  start_Time: string;

  @Column({ type: 'time' })
  end_Time: string;

  @Column()
  available: boolean;

  @Column({ default: 30 })
  interval: string;
  static available: number;

  @BeforeInsert()
  createId() {
    this.idSchedule = uuidv4().slice(0, 6);
  }
  @ManyToOne(() => Doctor, (doctor) => doctor.schedule)
  @JoinColumn({ name: 'idDoctor' })
  idDoctors: Doctor;

  @OneToOne(() => Shift, (shift) => shift.schedule)
  shift: Shift;
}
