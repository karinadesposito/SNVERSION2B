import { IsEmail, IsNotEmpty, MaxLength} from 'class-validator';
import { CreateSpecialityDto } from '../..//speciality/dto/create-speciality.dto';

export class CreateDoctorDto {
  @MaxLength(30)
  fullName: string;
  @IsEmail()
  @IsNotEmpty()
  mail: string;
  @IsNotEmpty()
  phone: string;
  @IsNotEmpty()
  speciality: CreateSpecialityDto;
  @IsNotEmpty()
  @MaxLength(14)
  license: string;
}
