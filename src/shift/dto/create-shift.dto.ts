import { IsNotEmpty } from 'class-validator';
import { BeforeInsert, PrimaryGeneratedColumn } from 'typeorm';
const { v4: uuidv4 } = require('uuid');
export class CreateShiftDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  idSchedule: string;

  @IsNotEmpty()
  idPatient: string;

  @BeforeInsert()
  createId() {
    this.id = uuidv4().slice(0, 6);
  }
}
