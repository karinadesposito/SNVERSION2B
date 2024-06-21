import { Doctor } from '../../doctors/entities/doctor.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'coverage' })
export class Coverage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 25 })
  coverages: string;

  @ManyToMany(() => Doctor, (doctor) => doctor.coverages)
  doctors: Doctor[];
}
