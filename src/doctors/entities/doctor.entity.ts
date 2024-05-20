import { Coverage } from 'src/coverage/entities/coverage.entity';
import { Person } from 'src/person/person.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Speciality } from 'src/speciality/entities/speciality.entity';
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
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'doctors' })
@Unique(['license'])
export class Doctor extends Person {
  @Column({ length: 14 })
  license: string;

  @DeleteDateColumn({ name: 'deletedAt', nullable: true, type: 'datetime' })
  deletedAt: Date;

  @UpdateDateColumn({ name: 'restoredAt', nullable: true, type: 'datetime' })
  restoredAt: Date;

  @OneToMany(() => Schedule, (schedule) => schedule.idDoctors)
  schedule: Schedule[];

  @ManyToOne(() => Speciality, (speciality) => speciality.idDoctor)
  @JoinColumn({ name: 'speciality' })
  speciality: Speciality;

  @ManyToMany(() => Coverage)
  @JoinTable()
  coverages: Coverage[];
}
