import { IsNotEmpty } from 'class-validator';

export class AddCoverageToDoctorDto {
  @IsNotEmpty()
  doctorId: number;

  @IsNotEmpty()
  coverageId: number[];
}