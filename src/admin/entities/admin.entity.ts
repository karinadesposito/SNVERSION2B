import { IsEmail, Length, Matches } from 'class-validator';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
const { v4: uuidv4 } = require('uuid');

@Entity()
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: number;
  @Column({ length: 14 })
  @Length(6, 14)
  username: string;

  @Column({ length: 40 })
  @IsEmail()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'El correo electrónico no es válido',
  })
  email: string;
  @Column({ length: 140 })
  @Length(8, 140)
  password: string;

  @BeforeInsert()
  createId() {
    this.id = uuidv4().slice(0, 6);
  }
}
