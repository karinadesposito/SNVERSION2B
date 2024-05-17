import { Coverage } from 'src/coverage/entities/coverage.entity';
import { Person } from 'src/person/person.entity';
import { Shift } from 'src/shift/entities/shift.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'patients' })
export class Patient extends Person {
  @Column({ length: 8 })
  dni: string;

  @Column({ length: 30 })
  address: string;

  @Column({ type: 'date' })
  birthday: Date;

  @DeleteDateColumn({ name: 'deletedAt', nullable: true, type: 'datetime' })
  deletedAt: Date;

  @UpdateDateColumn({ name: 'restoredAt', nullable: true, type: 'datetime' })
  restoredAt: Date;

  // el paciente puede tener muchos turnos
  @OneToMany(() => Shift, (shift) => shift.idPatient)
  shifts: Shift[];

  @OneToOne(() => Coverage)
  @JoinColumn()
  coverage:Coverage;
}
