import { Doctor } from '../../doctors/entities/doctor.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'speciality' })
export class Speciality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 25 })
  name: string;

  @OneToMany(() => Doctor, (doctor) => doctor.speciality)
  idDoctor: Doctor[];
}
