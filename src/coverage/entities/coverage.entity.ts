import { Doctor } from '../../doctors/entities/doctor.entity'
import { BeforeInsert, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
const { v4: uuidv4 } = require('uuid');
@Entity({ name: 'coverage' })
export class Coverage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 25 })
  coverages: string;

  @BeforeInsert()
  createId() {
    this.id = uuidv4().slice(0,6);
  }
  @ManyToMany(()=> Doctor, doctor => doctor.coverages)
  doctors:Doctor[]
}
