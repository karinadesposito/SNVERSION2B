import { IsNotEmpty } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';
export class CreateShiftDto {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  idSchedule: number;

  @IsNotEmpty()
  idPatient: number;
}
