import { Doctor } from 'src/doctors/entities/doctor.entity';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
const { v4: uuidv4 } = require('uuid');
@Entity({ name: 'coverage' })
export class Coverage {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ length: 25 })
  coverages: string;

  @BeforeInsert()
  createId() {
    this.id = uuidv4().slice(0, 6);
  }
  @OneToMany(()=> Doctor,(doctor)=> doctor.coverages)
  idDoctor:Doctor[];
}
