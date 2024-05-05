import { Person } from 'src/person/person.entity';
import { Shift } from 'src/shift/entities/shift.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'patients' })
export class Patient extends Person {
  @Column({ length: 8 })
  dni: string;

  @Column({ length: 30 })
  address: string;

  @Column({ length: 14 })
  healthCoverage: string;

  @Column({ type: 'date' })
  birthday: Date;

  // el paciente puede tener muchos turnos
  @OneToMany(() => Shift, (shift) => shift.idPatient)
  shifts: Shift[];
}
