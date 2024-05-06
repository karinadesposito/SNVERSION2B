import { Person } from 'src/person/person.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Shift } from 'src/shift/entities/shift.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'doctors' })
export class Doctor extends Person {
  @Column({ length: 20 })
  speciality: string;

  @Column({ length: 14 })
  license: string;

  @OneToMany(() => Schedule, (schedule) => schedule.idDoctors)
  schedule: Schedule[];

  @OneToMany(() => Shift, (shift) => shift.idDoctor)
  shift: Shift[];
}
