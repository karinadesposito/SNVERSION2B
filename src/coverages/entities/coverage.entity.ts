import { Doctor } from 'src/doctors/entities/doctor.entity';
import {
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  Entity,
  OneToMany,
} from 'typeorm';
const { v4: uuidv4 } = require('uuid');
@Entity({ name: 'Coverage' })
export class Coverage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length:25})
  healthCoverages: string;

  @BeforeInsert()
  createId() {
    this.id = uuidv4().slice(0, 6);
  }

  @OneToMany(() => Doctor, (doctor) => doctor.coverage)
  idDoctor: Doctor[];
}
