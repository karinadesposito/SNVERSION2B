import { IsNotEmpty } from 'class-validator';

export class AddCoverageToDoctorDto {
  @IsNotEmpty()
  doctorId: string;

  @IsNotEmpty()
  coverageId: string[];
}