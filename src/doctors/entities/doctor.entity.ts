import { Coverage } from 'src/coverage/entities/coverage.entity';
import { Person } from 'src/person/person.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Shift } from 'src/shift/entities/shift.entity';
import { Speciality } from 'src/speciality/entities/speciality.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'doctors' })
export class Doctor extends Person {
  @Column({ length: 14 })
  license: string;

  @DeleteDateColumn({ name: 'deletedAt', nullable: true, type: 'datetime' })
  deletedAt: Date;

  @UpdateDateColumn({ name: 'restoredAt', nullable: true, type: 'datetime' })
  restoredAt: Date;

  @OneToMany(() => Schedule, (schedule) => schedule.idDoctors)
  schedule: Schedule[];

  @OneToMany(() => Shift, (shift) => shift.idDoctor)
  shift: Shift[];

  @ManyToOne(() => Speciality, (speciality) => speciality.idDoctor)
  @JoinColumn({ name: 'speciality' })
  speciality: Speciality;

  //@ManyToOne(() => Coverage, (coverage) => coverage.idDoctor)
  //@JoinColumn({ name: 'coverageId' }) 
  //coverage: Coverage;

  @ManyToOne(()=>Coverage,(coverage)=> coverage.idDoctor)
  @JoinColumn({name:'coverage'})
  coverages:Coverage
}
