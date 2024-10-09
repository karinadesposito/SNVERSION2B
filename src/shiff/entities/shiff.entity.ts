// import { Patient } from '../../patients/entities/patient.entity';
// import { Schedule } from '../../schedules/entities/schedule.entity';

// import {
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   OneToOne,
//   PrimaryGeneratedColumn,
// } from 'typeorm';

// @Entity({ name: 'shiff' })
// export class Shiff {
//   @PrimaryGeneratedColumn()
//   id: number;

//   // Relación con Patient: cada turno está asociado a un paciente

//   @ManyToOne(() => Patient, (patient) => patient.shiffs)
//   @JoinColumn({ name: 'idPatient' }) // Especifica el nombre de la columna en la tabla de turnos
//   idPatient: Patient;

//   @OneToOne(() => Schedule, (schedule) => schedule.shiff)
//   @JoinColumn({ name: 'idScheduleBD' })
//   schedule: Schedule;
// }

