import { Doctor } from '../../doctors/entities/doctor.entity'
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
const { v4: uuidv4 } = require('uuid');
@Entity({ name: 'speciality' })
export class Speciality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 25 })
  name: string;

  @BeforeInsert()
  createId() {
    this.id = uuidv4().slice(0, 6);
  }

  @OneToMany(() => Doctor, (doctor) => doctor.speciality)
  idDoctor: Doctor[];
}
