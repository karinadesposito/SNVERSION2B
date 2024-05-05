import { IsEmail, IsNotEmpty, MaxLength} from 'class-validator';

export class CreateDoctorDto {
  @MaxLength(30)
  firstLastName: string;
  @IsEmail()
  @IsNotEmpty()
  mail: string;
  @IsNotEmpty()
  phone: string;
  @IsNotEmpty()
  @MaxLength(14)
  speciality: string;
  @IsNotEmpty()
  @MaxLength(14)
  license: string;
}
