import { IsEmail, IsNotEmpty, IsObject, MaxLength} from 'class-validator';
import { Speciality } from 'src/speciality/entities/speciality.entity';

export class CreateDoctorDto {
  @MaxLength(30)
  fullName: string;
  @IsEmail()
  @IsNotEmpty()
  mail: string;
  @IsNotEmpty()
  phone: string;
  @IsNotEmpty()
  speciality: Speciality;
  @IsNotEmpty()
  @MaxLength(14)
  license: string;
}
