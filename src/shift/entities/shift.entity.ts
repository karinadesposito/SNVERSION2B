import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';

import {
  BeforeInsert,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
const { v4: uuidv4 } = require('uuid');

@Entity({ name: 'shift' })
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  createId() {
    this.id = uuidv4().slice(0, 6);
  }

  // // Relación con Doctor: cada turno está asociado a un médico
  @ManyToOne(() => Doctor, (doctor) => doctor.shift)
  @JoinColumn({ name: 'idDoctor' })
  idDoctor: Doctor;

  // Relación con Patient: cada turno está asociado a un paciente

  @ManyToOne(() => Patient, (patient) => patient.shifts)
  @JoinColumn({ name: 'idPatient' }) // Especifica el nombre de la columna en la tabla de turnos
  idPatient: Patient;

  @OneToOne(() => Schedule, (schedule) => schedule.shift)
  @JoinColumn({ name: 'idScheduleBD' })
  schedule: Schedule;
}
