import { Coverage } from '../../coverage/entities/coverage.entity';
import { Person } from '../../person/person.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { Speciality } from '../../speciality/entities/speciality.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';

@Entity({ name: 'doctors' })
@Unique(['license'])
export class Doctor extends Person {
  @Column({ length: 14 })
  license: string;

  @DeleteDateColumn({ name: 'deletedAt', nullable: true, type: 'datetime' })
  deletedAt: Date;

  @OneToMany(() => Schedule, (schedule) => schedule.idDoctors)
  schedule: Schedule[];

  @ManyToOne(() => Speciality, (speciality) => speciality.idDoctor,
  { onDelete:'SET NULL'})
  @JoinColumn({ name: 'speciality' })
  speciality: Speciality;

  @ManyToMany(() => Coverage)
  @JoinTable()
  coverages: Coverage[];
}
