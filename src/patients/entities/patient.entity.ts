import { Coverage } from '../../coverage/entities/coverage.entity';
import { Person } from '../../person/person.entity';
import { Shiff } from '../../shiff/entities/shiff.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity({ name: 'patients' })
export class Patient extends Person {
  @Column({ length: 8 })
  dni: string;

  @Column({ length: 30 })
  address: string;

  @Column({ type: 'date' })
  birthday: Date;

  // el paciente puede tener muchos turnos
  @OneToMany(() => Shiff, (shiff) => shiff.idPatient)
  shiffs: Shiff[];

  @OneToOne(() => Coverage)
  @JoinColumn()
  coverage:Coverage;
}
