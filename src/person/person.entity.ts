import {
  BaseEntity,
  BeforeInsert,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
const { v4: uuidv4 } = require('uuid');

export class Person extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 30 })
  firstLastName: string;

  @Column({ length: 30 })
  mail: string;

  @Column({ length: 14 })
  phone: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;

  @BeforeInsert()
  createId() {
    this.id = uuidv4().slice(0, 6);
  }
}
