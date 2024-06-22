import { IsNotEmpty } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';
export class CreateShiffDto {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  idSchedule: number;

  @IsNotEmpty()
  idPatient: number;
}
