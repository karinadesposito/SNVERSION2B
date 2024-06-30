import { IsEmail, IsNotEmpty, Matches, MaxLength} from 'class-validator';
import { Speciality } from '../../speciality/entities/speciality.entity';

export class CreateDoctorDto {
  @MaxLength(30)
  fullName: string;
  @IsEmail()
  @IsNotEmpty()
  mail: string;
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, { message: 'el teléfono debe tener un total de 10 números (sin ceros iniciales ni guiones)' })
  phone: string;
  @IsNotEmpty()
  speciality: Speciality
  @IsNotEmpty()
  @Matches(/^(MP|MN)\d{6}$/, { message: 'La Licencia debe comenzar por "MP | MN" y luego incorporar 6 digitos 023548' })
  @MaxLength(8)
  license: string;
}
