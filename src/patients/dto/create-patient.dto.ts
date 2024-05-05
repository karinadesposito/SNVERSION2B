import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreatePatientDto {
  @MinLength(4)
  @MaxLength(25)
  firstLastName: string;
  @IsEmail()
  @IsNotEmpty()
  mail: string;
  @IsNotEmpty()
  phone: string;
  @IsNotEmpty()
  healthCoverage: string;
  @IsNotEmpty()
  dni: string;
  @IsNotEmpty()
  birthday: Date;
  @IsNotEmpty()
  address: string;
}
