import {
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

export class Person extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  fullName: string;

  @Column({ length: 30 })
  mail: string;

  @Column({ length: 14 })
  phone: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;
}
